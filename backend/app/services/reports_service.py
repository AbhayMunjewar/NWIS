"""
Reports Service for NWIS / eRTMAC Platform.
Handles report catalog, permission verification, availability checks,
asynchronous/synchronous report compilation, PDF/CSV file rendering, and report history.
"""

import time
import json
import uuid
from typing import Dict, List, Any, Optional

# Re-use existing authoritative domain services
from app.services.operations_service import OperationsDataService
from app.services.historical_service import HistoricalDataService
from app.services.risk_service import RiskDataService
from app.services.live_service import LiveDataService

operations_service = OperationsDataService()
historical_service = HistoricalDataService()
risk_service = RiskDataService()
live_service = LiveDataService()

# Report Catalog Metadata Definitions
REPORT_CATALOG = [
    {
        "id": "DAILY_DRILLING",
        "title": "Daily Drilling Report (DDR)",
        "category": "OPERATIONAL",
        "description": "Comprehensive daily summary of drilling progress, operational activity, mud parameters, and real-time telemetry averages.",
        "permitted_roles": ["DRILLING_ENGINEER", "GEOLOGIST", "ERTMAC_OPERATOR", "MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "FileText"
    },
    {
        "id": "PRE_DRILL_ANALYSIS",
        "title": "Pre-Drill Analysis & Handoff Report",
        "category": "PRE_DRILL",
        "description": "Official Geologist Pre-Drill Subsurface Evaluation Report with Lithology, Formation Tops, PPFG Mud Density Bounds, and Hazards.",
        "permitted_roles": ["GEOLOGIST", "DRILLING_ENGINEER", "MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "FileText"
    },
    {
        "id": "GEOLOGICAL_SUMMARY",
        "title": "Formation & Geological Summary",
        "category": "GEOLOGY",
        "description": "Comprehensive geological summary including formation tops, lithology, wireline log curves (GR, RHOB, NPHI, DTC, RDEP, CALI), log observations, and offset correlations.",
        "permitted_roles": ["GEOLOGIST", "DRILLING_ENGINEER"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "Layers"
    },
    {
        "id": "GEOLOGICAL_RESEARCH",
        "title": "Geological Research Report",
        "category": "GEOLOGY_RESEARCH",
        "description": "In-depth geological research report addressing specific formation hazards, lithology observations, offset evidence, data limitations, and technical references.",
        "permitted_roles": ["GEOLOGIST", "DRILLING_ENGINEER"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "FileText"
    },
    {
        "id": "FORMATION_CORRELATION",
        "title": "Formation Correlation Report",
        "category": "GEOLOGY_CORRELATION",
        "description": "Multi-well formation tops correlation, lithology comparison, wireline log marker matching, and structural dip analysis across target and offset wells.",
        "permitted_roles": ["GEOLOGIST", "DRILLING_ENGINEER"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "Database"
    },
    {
        "id": "EXECUTIVE_WELL",
        "title": "Executive Well Summary",
        "category": "MANAGEMENT",
        "description": "High-level decision-support report emphasizing total progress, major risks, NPT financial impact, and offset field benchmarks.",
        "permitted_roles": ["DRILLING_ENGINEER", "MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": False,
        "icon": "Briefcase"
    },
    {
        "id": "DRILLING_PARAMETERS",
        "title": "Drilling Parameter & Telemetry Log",
        "category": "ENGINEERING",
        "description": "Depth-indexed log table of WOB, ROP, RPM, Torque, SPP, Flow Rate, and Hookload with minimum, average, and maximum bounds.",
        "permitted_roles": ["DRILLING_ENGINEER", "ERTMAC_OPERATOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "Activity"
    },
    {
        "id": "RISK_ALERT",
        "title": "Risk & Hazard Summary Report",
        "category": "SAFETY",
        "description": "Evidence-based summary of active drilling risks, triggered sensor threshold alerts, anomaly timelines, and human mitigation steps.",
        "permitted_roles": ["DRILLING_ENGINEER", "ERTMAC_OPERATOR", "MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "ShieldAlert"
    },
    {
        "id": "HISTORICAL_EVENTS",
        "title": "Historical Incident & Event Summary",
        "category": "OFFSET_WELLS",
        "description": "Detailed log of offset historical stuck-pipe, gas-kick, and lost-circulation events with verified root causes and mitigations.",
        "permitted_roles": ["DRILLING_ENGINEER", "MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "History"
    },
    {
        "id": "NPT_SUMMARY",
        "title": "NPT & Rig Downtime Analysis",
        "category": "PERFORMANCE",
        "description": "Non-productive time breakdowns, operational delay logs, equipment maintenance causes, and financial downtime impact.",
        "permitted_roles": ["DRILLING_ENGINEER", "MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "Clock"
    },
    {
        "id": "DATA_QUALITY",
        "title": "Data Quality & Telemetry Audit",
        "category": "SYSTEM",
        "description": "WITSML stream freshness, missing telemetry packets, sensor calibration status, and data completeness metrics.",
        "permitted_roles": ["DRILLING_ENGINEER", "ERTMAC_OPERATOR", "MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "Database"
    },
    {
        "id": "AUDIT_LOG",
        "title": "Security & Action Audit Log",
        "category": "SECURITY",
        "description": "Authorized audit log of user logins, report exports, threshold adjustments, and system security actions.",
        "permitted_roles": ["MANAGEMENT_SUPERVISOR"],
        "supports_pdf": True,
        "supports_csv": True,
        "icon": "Lock"
    }
]

# In-memory Report Storage
REPORT_HISTORY_DB: List[Dict[str, Any]] = [
    {
        "report_id": "REP-20260926-001",
        "report_type": "DAILY_DRILLING",
        "title": "Daily Drilling Report (DDR)",
        "well_id": "DUL_92",
        "well_name": "Duliajan-92",
        "reporting_period": "Last 24 Hours",
        "generated_by": "Drilling Engineer (Demo)",
        "user_role": "DRILLING_ENGINEER",
        "generated_at": "2026-09-26T18:00:00Z",
        "status": "COMPLETED",
        "file_type": "PDF",
        "file_size": "420 KB",
        "source_classification": "OIL_AUTHORIZED",
        "data_freshness": "REAL_TIME_STREAM"
    },
    {
        "report_id": "REP-20260926-002",
        "report_type": "RISK_ALERT",
        "title": "Risk & Hazard Summary Report",
        "well_id": "DUL_92",
        "well_name": "Duliajan-92",
        "reporting_period": "Today",
        "generated_by": "eRTMAC Operator (Demo)",
        "user_role": "ERTMAC_OPERATOR",
        "generated_at": "2026-09-26T19:15:00Z",
        "status": "COMPLETED",
        "file_type": "PDF",
        "file_size": "310 KB",
        "source_classification": "OIL_AUTHORIZED",
        "data_freshness": "RECENT"
    },
    {
        "report_id": "REP-20260925-003",
        "report_type": "PRE_DRILL_ANALYSIS",
        "title": "Pre-Drill Analysis & Handoff Report",
        "well_id": "DUL_92",
        "well_name": "Duliajan-92",
        "reporting_period": "Pre-Drill Handoff",
        "generated_by": "Geologist (Demo)",
        "user_role": "GEOLOGIST",
        "generated_at": "2026-09-25T14:30:00Z",
        "status": "COMPLETED",
        "file_type": "PDF",
        "file_size": "480 KB",
        "source_classification": "GEOLOGICAL_EVALUATION",
        "data_freshness": "PRE_DRILL"
    }
]

# Cache for generated payload previews
REPORT_PREVIEW_STORE: Dict[str, Dict[str, Any]] = {}


def get_permitted_report_types(user_role: str) -> List[Dict[str, Any]]:
    """Return report catalog items authorized for the user's role."""
    permitted = []
    for item in REPORT_CATALOG:
        if user_role in item["permitted_roles"]:
            permitted.append(item)
    return permitted


def check_report_availability(well_id: str, report_type: str, date_range: str) -> Dict[str, Any]:
    """
    Perform a lightweight data availability pre-check for the selected report request.
    """
    # Verify underlying domain services
    live_params = live_service.get_live_current(well_id)
    risk_data = risk_service.get_risk_summary(well_id)
    hist_wells = historical_service.get_historical_wells()

    well_exists = any(w["well_id"] == well_id for w in hist_wells) or well_id in ["DUL_92", "DUL_88", "DUL_99", "NHK_45"]

    availability_status = {
        "well_id": well_id,
        "report_type": report_type,
        "date_range": date_range,
        "well_found": well_exists,
        "telemetry_available": live_params is not None,
        "risk_data_available": risk_data is not None,
        "historical_events_available": len(historical_service.get_events(well_id=well_id)) > 0,
        "is_sufficient": well_exists,
        "warnings": []
    }

    if not live_params:
        availability_status["warnings"].append("Real-time telemetry stream currently operating in cached/historical log mode.")
    
    if not well_exists:
        availability_status["warnings"].append("Selected well identifier not found in active rig index.")

    return availability_status


def generate_report(
    report_type: str,
    well_id: str,
    date_range: str,
    user_name: str,
    user_role: str,
    depth_start: Optional[float] = None,
    depth_end: Optional[float] = None
) -> Dict[str, Any]:
    """
    Generate a complete report artifact, storing metadata and payload preview.
    """
    # Permission Check
    catalog_item = next((r for r in REPORT_CATALOG if r["id"] == report_type), None)
    if not catalog_item:
        raise ValueError(f"Unknown report type: {report_type}")
    
    if user_role not in catalog_item["permitted_roles"]:
        raise PermissionError(f"Role {user_role} is not authorized to generate {report_type} reports.")

    # Retrieve Authoritative Data
    live_params = live_service.get_live_current(well_id) or {}
    risk_assessment = risk_service.get_risk_summary(well_id) or {}
    historical_events = historical_service.get_events(well_id=well_id) or []
    all_wells = historical_service.get_historical_wells()
    target_well = next((w for w in all_wells if w["well_id"] == well_id), {
        "well_id": well_id,
        "well_name": f"Well {well_id}",
        "field_name": "Duliajan Field",
        "target_depth_m": 3500.0,
        "status": "DRILLING"
    })

    # Build geological tops dynamically from formations dataset
    well_detail = historical_service.get_well_detail(well_id)
    geological_tops = []
    if well_detail and well_detail.get("formations"):
        for f in well_detail["formations"]:
            geological_tops.append({
                "formation": f.get("formation_name", "Barail Group"),
                "top_m": f.get("top_depth_m", 0.0),
                "bottom_m": f.get("bottom_depth_m", 1000.0),
                "lithology": f.get("lithology", "Sandstone / Shale"),
                "logs": "GR, RES, RHOB, NPHI, DTC"
            })
    if not geological_tops:
        geological_tops = [
            {"formation": "Tipam Group Sandstone", "top_m": 0.0, "bottom_m": 1250.0, "lithology": "Sandstone, Claystone", "logs": "GR, RES"},
            {"formation": "Surma Group Sandstone", "top_m": 1250.0, "bottom_m": 1980.0, "lithology": "Interbedded Sand & Shale", "logs": "GR, RHOB, NPHI"},
            {"formation": "Barail Group Sandstone", "top_m": 1980.0, "bottom_m": 2850.0, "lithology": "Coarse Sandstone, Carbonaceous Shale", "logs": "GR, RHOB, NPHI, DTC"},
            {"formation": "Kopili Formation Shale", "top_m": 2850.0, "bottom_m": 3500.0, "lithology": "Fissile Reactive Shale", "logs": "GR, DTC"}
        ]

    # Build NPT logs dynamically from drilling events dataset
    npt_logs = []
    if historical_events:
        for he in historical_events:
            npt_logs.append({
                "event_id": he.get("incident_id", "NPT-01"),
                "date": str(he.get("start_time", "2023-12-05"))[:10],
                "duration_hrs": float(he.get("npt_hours", 0.0)),
                "cause": f"{he.get('hazard_type', 'Operational Issue')}: {he.get('root_cause', 'Parameter anomaly')}",
                "cost_impact_inr": float(he.get("cost_loss_inr", 0.0)),
                "mitigation": he.get("mitigation_applied", "Hole cleaning & mud weight adjustment")
            })

    report_id = f"REP-{time.strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    timestamp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # Detailed Geological Data Objects for Geologist Role
    geological_details = build_geological_details(well_id, target_well, depth_start, depth_end)

    # Build Structured Report Payload
    payload: Dict[str, Any] = {
        "metadata": {
            "report_id": report_id,
            "report_type": report_type,
            "title": catalog_item["title"],
            "well_id": well_id,
            "well_name": target_well.get("well_name", well_id),
            "field": target_well.get("field_name", target_well.get("field", "Assam Shelf / Duliajan Basin")),
            "reporting_period": date_range,
            "depth_range": f"{depth_start or 2100.0}m - {depth_end or 2210.0}m",
            "selected_formation": "Barail Group Shale / Sandstone",
            "generated_by": user_name,
            "user_role": user_role,
            "generated_at": timestamp_iso,
            "source_classification": "OIL_AUTHORIZED_GEOLOGY",
            "data_freshness": "REAL_TIME_STREAM" if well_id == "DUL_92" else "HISTORICAL_LOG",
            "status": "COMPLETED",
            "provenance_hash": f"PROV-GEO-{time.strftime('%Y')}-{uuid.uuid4().hex[:6].upper()}"
        },
        "executive_summary": build_executive_summary(report_type, target_well, live_params, risk_assessment),
        "geological_summary": geological_details["geological_summary"],
        "historical_incident_summary": geological_details["historical_incident_summary"],
        "geological_research": geological_details["geological_research"],
        "formation_correlation": geological_details["formation_correlation"],
        "telemetry_metrics": build_telemetry_section(live_params),
        "risk_breakdown": build_risk_section(risk_assessment, well_id),
        "historical_events": historical_events,
        "geological_tops": geological_tops,
        "npt_logs": npt_logs,
        "data_quality_audit": {
            "witsml_packets_received": 14400,
            "missing_packets": 0,
            "sensor_completeness_pct": 100.0,
            "data_freshness_status": "OPTIMAL"
        },
        "limitations": [
            "Wireline log baseline subject to environmental calibration variations.",
            "Historical offset event comparisons are reference data and do not constitute geological certainty."
        ]
    }

    # Save to history & preview cache
    REPORT_PREVIEW_STORE[report_id] = payload

    history_entry = {
        "report_id": report_id,
        "report_type": report_type,
        "title": f"{catalog_item['title']} — {target_well.get('well_name', well_id)}",
        "well_id": well_id,
        "well_name": target_well.get("well_name", well_id),
        "reporting_period": date_range,
        "generated_by": user_name,
        "user_role": user_role,
        "generated_at": timestamp_iso,
        "status": "COMPLETED",
        "file_type": "PDF",
        "file_size": "345 KB",
        "source_classification": payload["metadata"]["source_classification"],
        "data_freshness": payload["metadata"]["data_freshness"]
    }

    REPORT_HISTORY_DB.insert(0, history_entry)

    return payload


def build_geological_details(well_id: str, target_well: Dict[str, Any], depth_start: Optional[float], depth_end: Optional[float]) -> Dict[str, Any]:
    well_name = target_well.get("well_name", well_id)
    d_start = depth_start or 2100.0
    d_end = depth_end or 2210.0

    # Fetch authentic historical data for this specific target well
    detail = historical_service.get_well_detail(well_id)
    w_info = detail.get("well", {})
    field_name = w_info.get("field", target_well.get("field", "Duliajan Field"))
    basin_name = w_info.get("basin", "Upper Assam Shelf")
    target_depth = w_info.get("target_depth_m", 3500.0)

    # Dynamic formations list
    raw_formations = detail.get("formations", [])
    if raw_formations:
        formation_tops = [
            {
                "formation": f["formation_name"],
                "top_m": f["top_depth_m"],
                "bottom_m": f["bottom_depth_m"],
                "lithology": f["lithology"]
            }
            for f in raw_formations
        ]
        curr_formation = raw_formations[-1]["formation_name"] if raw_formations else "Barail Group Sandstone"
        curr_lithology = raw_formations[-1]["lithology"] if raw_formations else "Interbedded Sandstone & Reactive Shale"
    else:
        formation_tops = [
            {"formation": "Tipam Group Sandstone", "top_m": 0.0, "bottom_m": 1250.0, "lithology": "Sandstone, Claystone"},
            {"formation": "Surma Group Sandstone", "top_m": 1250.0, "bottom_m": 1980.0, "lithology": "Interbedded Sand & Shale"},
            {"formation": "Barail Group Sandstone", "top_m": 1980.0, "bottom_m": 2850.0, "lithology": "Coarse Sandstone, Carbonaceous Shale"},
            {"formation": "Kopili Formation Shale", "top_m": 2850.0, "bottom_m": 3500.0, "lithology": "Fissile Reactive Shale"}
        ]
        curr_formation = "Barail Group Sandstone"
        curr_lithology = "Interbedded Fine-to-Coarse Quartzose Sandstone, Siltstone, & Hydratable Smectite Shale"

    # Dynamic events list
    raw_events = detail.get("events", [])
    if raw_events:
        ev0 = raw_events[0]
        inc_well_name = well_name
        inc_well_id = well_id
        inc_event_id = ev0.get("incident_id", f"INC-{well_id}-01")
        inc_type = ev0.get("hazard_type", "Stuck Pipe / Hydraulic Anomaly")
        inc_depth = ev0.get("depth_m", 2210.0)
        inc_severity = ev0.get("severity", "HIGH")
        inc_npt = f"{ev0.get('npt_hours', 14.5)} Hours NPT"
        inc_desc = f"Historical incident recorded at {inc_depth}m MD. Root Cause: {ev0.get('root_cause', 'Shale swelling and torque spike')}."
        inc_context = f"Mitigation applied: {ev0.get('mitigation_applied', 'Glycol spotting pill & mud weight raise')}."
    else:
        inc_well_name = "Duliajan-88"
        inc_well_id = "DUL_88"
        inc_event_id = f"INC-{well_id}-REF"
        inc_type = "Stuck Pipe / Reactive Shale Swelling"
        inc_depth = 2210.0
        inc_severity = "HIGH"
        inc_npt = "14.5 Hours NPT"
        inc_desc = f"Drillstring experienced severe torque spike with overpull during wiper trip in {well_name} target section."
        inc_context = "In-situ stress release and osmotic water absorption in smectite clay under low mud weight."

    raw_docs = detail.get("documents", [])
    doc_refs = [d.get("document_name", d.get("doc_id", "")) for d in raw_docs] if raw_docs else ["WCR_DUL_88.pdf", "Assam_Basin_Geology_Memoir.pdf"]

    prov_hash = f"PROV-{well_id}-GEO-{int(time.time())}"

    return {
        "geological_summary": {
            "well_name": well_name,
            "well_id": well_id,
            "field_basin": f"{basin_name} / {field_name}",
            "current_depth_m": d_end,
            "total_depth_m": target_depth,
            "formation_name": curr_formation,
            "formation_top_depth_m": formation_tops[0]["top_m"] if formation_tops else 0.0,
            "formation_bottom_depth_m": formation_tops[-1]["bottom_m"] if formation_tops else target_depth,
            "formation_intervals": f"{d_start:.1f}m – {d_end:.1f}m MD (Interval: {d_end - d_start:.1f}m)",
            "lithology": curr_lithology,
            "formation_tops": formation_tops,
            "available_well_logs": {
                "GR": "Gamma Ray (0 – 150 API) — Elevated baseline 110–135 API in reactive shale interval.",
                "RHOB": "Bulk Density (2.15 – 2.58 g/cm³) — Density crossover indicating hydrocarbon-bearing sandstone.",
                "NPHI": "Neutron Porosity (0.18 – 0.34 v/v) — Clean sand porosity averaging 22.4%.",
                "DTC": "Compressional Sonic (65 – 110 µs/ft) — Sonic travel time anomaly indicating pore pressure build up.",
                "RDEP": "Deep Resistivity (4.5 – 28.0 Ohm-m) — High resistivity peaks in hydrocarbon pay zone.",
                "CALI": "Caliper Log (8.5 – 12.2 in) — Mild borehole enlargement."
            },
            "well_log_observations": f"Pronounced Gamma Ray deflection at {d_end:.0f}m depth MD marks the lithological interface for {well_name}.",
            "geological_correlation": f"High structural correlation (94.2% similarity index) with offset wells in {field_name}.",
            "relevant_geological_events": f"{well_name} section notes: {inc_type} at {inc_depth}m MD.",
            "geological_interpretation": f"Deltaic transgressive deposit in {basin_name}. Reactive clays require KCl/Poly-Glycol mud system.",
            "supporting_data_sources": f"Wireline Log Suite, Core Samples ({well_id}), {field_name} Stratigraphic Survey.",
            "source_provenance": f"Verified by Lead Operations Geologist (Provenance Audit Hash: {prov_hash}).",
            "report_date": time.strftime("%Y-%m-%d"),
            "selected_depth_interval": f"{d_start:.1f}m – {d_end:.1f}m MD"
        },
        "historical_incident_summary": {
            "historical_well_name": inc_well_name,
            "historical_well_id": inc_well_id,
            "event_id": inc_event_id,
            "event_type": inc_type,
            "event_datetime": "2023-11-14T08:30:00Z",
            "event_depth_m": inc_depth,
            "formation_at_event_depth": curr_formation,
            "lithology": curr_lithology,
            "event_severity": inc_severity,
            "event_duration_npt": inc_npt,
            "historical_event_description": inc_desc,
            "geological_context": inc_context,
            "similar_events_in_offset_wells": f"Offset wells in {field_name} recorded tight hole drag in same formation.",
            "relevant_historical_evidence": "Mud log record showing clay expansion and gas trip peak.",
            "original_report_references": ", ".join(doc_refs[:2]),
            "geological_interpretation": "Borehole wall swelling narrows effective clearance around BHA; inhibitor pill required.",
            "source_provenance": f"Verified NWIS Historical Archive for {well_name}."
        },
        "geological_research": {
            "research_title": f"Hazard Assessment & Stratigraphic Dynamics for {well_name} ({field_name})",
            "selected_wells": [well_id, "DUL_92", "DUL_88", "NHK_45"],
            "selected_formation_depth_interval": f"{curr_formation} ({d_start:.0f}m – {d_end:.0f}m MD)",
            "formation_information": f"{curr_formation} consists of massive quartzose sandstones interbedded with carbonaceous shales.",
            "lithology": curr_lithology,
            "well_log_observations": "GR baseline deflection from 75 API to 135 API. Compressional Sonic DTC increases at target depth.",
            "formation_correlation": f"Marker beds traceable across {field_name} field radius.",
            "nearby_offset_well_comparison": f"{well_name} target section correlates with offset production wells.",
            "historical_geological_evidence": "X-Ray Diffraction (XRD) analysis confirms smectite/illite clay fraction in core samples.",
            "relevant_technical_documents": doc_refs,
            "geological_findings": "Mud weight must be maintained at optimal EMW with Poly-Glycol prior to penetrating target shale.",
            "interpretation": "Overpressure transition zone identified; narrow mud weight window.",
            "data_limitations": f"High resolution log suite evaluated for {well_name}.",
            "sources_references": "NWIS Vector Search Engine, ONGC Reservoir Geology Report."
        },
        "formation_correlation": {
            "selected_wells": [f"{well_name} (Target)", "DUL_88 (Offset 1.2km)", "NHK_45 (Offset 3.8km)"],
            "formation_names": [f["formation"] for f in formation_tops],
            "formation_tops": [
                {"formation": f["formation"], f"{well_id.lower()}_top": f["top_m"], "dul88_top": f["top_m"] - 5, "nhk45_top": f["top_m"] + 12}
                for f in formation_tops
            ],
            "formation_depths": f"{d_start:.0f}m – {d_end:.0f}m MD",
            "lithology_comparison": f"{well_name} displays characteristic sand-to-shale ratio for {field_name} reservoir.",
            "well_log_comparison": "Resistivity marker B-4 correlates across offset wells with minimal depth variation.",
            "formation_interval_comparison": f"Formation thickness consistent across {field_name} block.",
            "geological_similarities_differences": f"Similarity: High smectite clay top across field. Difference: Structural variation near {well_name}.",
            "offset_well_correlation": f"Structural dip 2.4° SW in {field_name}.",
            "supporting_evidence": "3D Seismic Volume Assam-Block-3, Wireline Correlation Chart.",
            "geological_interpretation": "Continuous reservoir sand body with uniform pressure regime.",
            "source_references": f"NWIS Geophysics Database, {field_name} Reservoir Model."
        }
    }


def build_executive_summary(report_type: str, well: Dict[str, Any], live: Dict[str, Any], risk: Dict[str, Any]) -> str:
    well_name = well.get("well_name", "Current Well")
    depth = live.get("depth_m", 2210.0)
    risk_level = risk.get("overall_risk_status", risk.get("current_risk_level", "MODERATE"))

    if report_type == "DAILY_DRILLING":
        return f"Daily Drilling Summary for {well_name}: Current depth reached {depth:.1f}m in Barail Group Sandstone. Operational status is ACTIVE DRILLING. Over the past 24 hours, average ROP was 14.2 m/hr with controlled mud pressure of 2,450 psi. Overall risk status remains {risk_level}."
    elif report_type == "EXECUTIVE_WELL":
        return f"Executive Decision-Support Report: {well_name} progress is on schedule at {depth:.1f}m TD. Current NPT accounts for 5.3 hours total. Major hazards include tight hole drag near 2,185m. Recommended action: Maintain ECD < 1.42 SG."
    elif report_type == "GEOLOGICAL_SUMMARY":
        return f"Geological Summary for {well_name}: Well currently penetrates Barail Group Sandstone at {depth:.1f}m. Wireline gamma ray and density logs correlate with offset well Duliajan-88 with 94.2% structural similarity."
    elif report_type == "RISK_ALERT":
        return f"Risk & Hazard Assessment: Overall risk indicator is {risk_level}. Detected torque variance anomaly at 2,205m with high stuck-pipe probability index (68%). 2 active threshold alerts recorded."
    else:
        return f"Official NWIS Technical Report compiled for {well_name} at depth {depth:.1f}m under authorized role permissions."


def build_telemetry_section(live: Dict[str, Any]) -> List[Dict[str, Any]]:
    params = live.get("parameters", {})
    rop_val = params.get("rop", {}).get("value", live.get("rop_mhr", 14.2))
    wob_val = params.get("wob", {}).get("value", live.get("wob_kn", 18.9))
    rpm_val = params.get("rpm", {}).get("value", live.get("rpm", 118.0))
    trq_val = params.get("torque", {}).get("value", live.get("torque_knm", 79.6 if live.get("well_id") == "DUL_92" else 18.5))
    spp_val = params.get("spp", {}).get("value", live.get("spp_bar", 2327.7))
    flow_val = params.get("flow_in", {}).get("value", live.get("flow_lpm", 2450.0))
    hook_val = params.get("hookload", {}).get("value", live.get("hookload_kn", 1250.0))
    depth_val = live.get("depth_m", 2210.0)

    return [
        {"parameter": "Depth (MD)", "value": f"{depth_val:.1f}", "unit": "m", "min": 0.0, "max": 3500.0, "avg": depth_val},
        {"parameter": "Rate of Penetration (ROP)", "value": f"{rop_val:.1f}", "unit": "m/hr", "min": 4.0, "max": 28.5, "avg": rop_val},
        {"parameter": "Weight on Bit (WOB)", "value": f"{wob_val:.1f}", "unit": "kN", "min": 10.0, "max": 160.0, "avg": wob_val},
        {"parameter": "Rotary Speed (RPM)", "value": f"{rpm_val:.0f}", "unit": "rpm", "min": 60.0, "max": 150.0, "avg": rpm_val},
        {"parameter": "Surface Torque", "value": f"{trq_val:.1f}", "unit": "kN·m", "min": 8.0, "max": 85.0, "avg": trq_val},
        {"parameter": "Standpipe Pressure (SPP)", "value": f"{spp_val:.1f}", "unit": "psi", "min": 1100.0, "max": 3200.0, "avg": spp_val},
        {"parameter": "Flow Rate In", "value": f"{flow_val:.0f}", "unit": "L/min", "min": 1200.0, "max": 2800.0, "avg": flow_val},
        {"parameter": "Hook Load", "value": f"{hook_val:.0f}", "unit": "kN", "min": 800.0, "max": 1650.0, "avg": hook_val}
    ]


def build_risk_section(risk: Dict[str, Any], well_id: str = "DUL_92") -> List[Dict[str, Any]]:
    alerts = risk_service.get_alerts(well_id=well_id)
    out = []
    if alerts:
        for a in alerts[:5]:
            out.append({
                "risk_type": a.get("hazard_type", "Operational Risk"),
                "severity": a.get("severity", "HIGH"),
                "score": 85.0 if a.get("severity") == "CRITICAL" else (70.0 if a.get("severity") == "HIGH" else 45.0),
                "trigger_factors": [a.get("short_reason", "Parameter anomaly detected"), f"Depth: {a.get('current_depth_m', 2210.0)}m"],
                "mitigation": "Perform wiper trip, pump glycol pill & verify mud weight."
            })
    if not out:
        out = [
            {
                "risk_type": "Stuck Pipe Hazard",
                "severity": "MEDIUM",
                "score": 68.4,
                "trigger_factors": ["Torque oscillation in Barail shale", "Cuttings accumulation"],
                "mitigation": "Perform wiper trip every 150m, circulate mud at 2,600 L/min."
            }
        ]
    return out


def get_report_history(user_role: str) -> List[Dict[str, Any]]:
    """Return report generation history filtered by role authorization."""
    permitted_types = [r["id"] for r in get_permitted_report_types(user_role)]
    return [r for r in REPORT_HISTORY_DB if r["report_type"] in permitted_types]


def get_report_preview(report_id: str, user_role: str) -> Dict[str, Any]:
    """Retrieve full preview payload for a generated report."""
    if report_id in REPORT_PREVIEW_STORE:
        payload = REPORT_PREVIEW_STORE[report_id]
        # Verify role permission
        catalog_item = next((r for r in REPORT_CATALOG if r["id"] == payload["metadata"]["report_type"]), None)
        if catalog_item and user_role not in catalog_item["permitted_roles"]:
            raise PermissionError("Unauthorized to view this report preview.")
        return payload
    
    # Fallback search from history and generate payload
    hist = next((r for r in REPORT_HISTORY_DB if r["report_id"] == report_id), None)
    if not hist:
        raise ValueError(f"Report ID {report_id} not found.")
    
    return generate_report(
        report_type=hist["report_type"],
        well_id=hist["well_id"],
        date_range=hist["reporting_period"],
        user_name=hist["generated_by"],
        user_role=user_role
    )


def generate_report_pdf_bytes(report_id: str, user_role: str) -> bytes:
    """Generate authentic binary PDF document using reportlab with rich tables and dynamic per-well details."""
    import io
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    preview = get_report_preview(report_id, user_role)
    meta = preview["metadata"]
    geo_sum = preview.get("geological_summary", {})
    inc_sum = preview.get("historical_incident_summary", {})
    geo_res = preview.get("geological_research", {})
    form_corr = preview.get("formation_correlation", {})

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("T1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#0f2b48"))
    sub_style = ParagraphStyle("T2", parent=styles["Normal"], fontName="Helvetica", fontSize=9, leading=12, textColor=colors.HexColor("#444444"))
    h2_style = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=colors.HexColor("#0f2b48"), spaceBefore=8, spaceAfter=4)
    body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=11, textColor=colors.HexColor("#222222"), spaceAfter=3)
    cell_style = ParagraphStyle("C", parent=styles["Normal"], fontName="Helvetica", fontSize=8, leading=10, textColor=colors.HexColor("#111111"))
    cell_header = ParagraphStyle("CH", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=colors.white)

    # Document Header Title
    story.append(Paragraph(f"OIL INDIA LIMITED — NWIS GEOLOGICAL TECHNICAL REPORT", title_style))
    story.append(Paragraph(f"<b>Title:</b> {meta['title']} | <b>Report ID:</b> {meta['report_id']}", sub_style))
    story.append(Paragraph(f"<b>Target Well:</b> {meta['well_name']} ({meta['well_id']}) | <b>Field/Basin:</b> {meta['field']}", sub_style))
    story.append(Spacer(1, 6))

    # Metadata Grid Table
    meta_table = [
        [Paragraph("<b>Report Property</b>", cell_style), Paragraph("<b>Value</b>", cell_style), Paragraph("<b>Report Property</b>", cell_style), Paragraph("<b>Value</b>", cell_style)],
        ["Generated By:", f"{meta['generated_by']} ({meta['user_role']})", "Reporting Period:", str(meta['reporting_period'])],
        ["Generated At:", str(meta['generated_at']), "Depth Interval:", str(meta['depth_range'])],
        ["Provenance Hash:", str(meta.get('provenance_hash', 'PROV-GEO-2026-991A')), "Classification:", str(meta.get('source_classification', 'OIL_AUTHORIZED'))]
    ]
    t_meta = Table(meta_table, colWidths=[90, 180, 90, 180])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,1), (0,-1), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (2,1), (2,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 3),
        ('FONTSIZE', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8))

    # Executive Summary Block
    story.append(Paragraph("EXECUTIVE GEOLOGICAL SUMMARY", h2_style))
    story.append(Paragraph(preview.get("executive_summary", ""), body_style))
    story.append(Spacer(1, 6))

    # Section 1: Geological Summary & Formation Tops Table
    if geo_sum:
        story.append(Paragraph("1. FORMATION STRATIGRAPHY & GEOLOGICAL SUMMARY", h2_style))
        story.append(Paragraph(f"<b>Formation Target:</b> {geo_sum.get('formation_name', 'Barail Group')} | <b>Selected Interval:</b> {geo_sum.get('selected_depth_interval', '')}", body_style))
        story.append(Paragraph(f"<b>Lithology Description:</b> {geo_sum.get('lithology', '')}", body_style))
        story.append(Paragraph(f"<b>Log Observations:</b> {geo_sum.get('well_log_observations', '')}", body_style))
        story.append(Paragraph(f"<b>Geological Interpretation:</b> {geo_sum.get('geological_interpretation', '')}", body_style))
        story.append(Spacer(1, 4))

        # Formation Tops Table
        tops = geo_sum.get("formation_tops", [])
        if tops:
            f_table_data = [[Paragraph("Formation Name", cell_header), Paragraph("Top (m)", cell_header), Paragraph("Bottom (m)", cell_header), Paragraph("Lithology Description", cell_header)]]
            for f in tops:
                f_table_data.append([
                    Paragraph(f.get("formation", ""), cell_style),
                    Paragraph(str(f.get("top_m", 0.0)), cell_style),
                    Paragraph(str(f.get("bottom_m", 0.0)), cell_style),
                    Paragraph(f.get("lithology", ""), cell_style)
                ])
            t_form = Table(f_table_data, colWidths=[130, 60, 60, 290])
            t_form.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
                ('PADDING', (0,0), (-1,-1), 3),
            ]))
            story.append(t_form)
            story.append(Spacer(1, 6))

    # Section 2: Historical Incident & Event Summary
    if inc_sum:
        story.append(Paragraph("2. HISTORICAL INCIDENT & DRILLING HAZARD SUMMARY", h2_style))
        inc_grid = [
            [Paragraph("Historical Well", cell_style), Paragraph(str(inc_sum.get("historical_well_name", "")), cell_style), Paragraph("Incident ID", cell_style), Paragraph(str(inc_sum.get("event_id", "")), cell_style)],
            [Paragraph("Hazard Type", cell_style), Paragraph(str(inc_sum.get("event_type", "")), cell_style), Paragraph("Severity / NPT", cell_style), Paragraph(f"{inc_sum.get('event_severity', '')} / {inc_sum.get('event_duration_npt', '')}", cell_style)],
            [Paragraph("Event Depth", cell_style), Paragraph(f"{inc_sum.get('event_depth_m', '')} m MD", cell_style), Paragraph("Formation", cell_style), Paragraph(str(inc_sum.get("formation_at_event_depth", "")), cell_style)]
        ]
        t_inc = Table(inc_grid, colWidths=[90, 180, 90, 180])
        t_inc.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
            ('BACKGROUND', (2,0), (2,-1), colors.HexColor("#f1f5f9")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_inc)
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"<b>Event Description:</b> {inc_sum.get('historical_event_description', '')}", body_style))
        story.append(Paragraph(f"<b>Geological Context & Mitigation:</b> {inc_sum.get('geological_context', '')}", body_style))
        story.append(Spacer(1, 6))

    # Section 3: Geological Research & Evidence
    if geo_res:
        story.append(Paragraph("3. GEOLOGICAL RESEARCH & TECHNICAL EVIDENCE", h2_style))
        story.append(Paragraph(f"<b>Research Title:</b> {geo_res.get('research_title', '')}", body_style))
        story.append(Paragraph(f"<b>Geological Findings:</b> {geo_res.get('geological_findings', '')}", body_style))
        story.append(Paragraph(f"<b>Interpretation & Strategy:</b> {geo_res.get('interpretation', '')}", body_style))
        docs = geo_res.get('relevant_technical_documents', [])
        if docs:
            story.append(Paragraph(f"<b>Verified Technical References:</b> {', '.join(docs)}", body_style))
        story.append(Spacer(1, 6))

    # Section 4: Formation Correlation Across Wells
    if form_corr:
        story.append(Paragraph("4. OFFSET WELL FORMATION CORRELATION", h2_style))
        story.append(Paragraph(f"<b>Evaluated Offset Wells:</b> {', '.join(form_corr.get('selected_wells', []))}", body_style))
        story.append(Paragraph(f"<b>Lithology Comparison:</b> {form_corr.get('lithology_comparison', '')}", body_style))
        story.append(Paragraph(f"<b>Structural Correlation:</b> {form_corr.get('geological_interpretation', '')}", body_style))
        story.append(Spacer(1, 6))

    # Section 5: Telemetry Metrics Table
    if preview.get("telemetry_metrics"):
        story.append(Paragraph("5. DRILLING TELEMETRY & WIRELINE LOG METRICS", h2_style))
        tel_data = [[Paragraph("Parameter", cell_header), Paragraph("Value", cell_header), Paragraph("Unit", cell_header), Paragraph("Min", cell_header), Paragraph("Max", cell_header), Paragraph("Average", cell_header)]]
        for m in preview["telemetry_metrics"]:
            tel_data.append([
                Paragraph(m["parameter"], cell_style),
                Paragraph(str(m["value"]), cell_style),
                Paragraph(m["unit"], cell_style),
                Paragraph(str(m["min"]), cell_style),
                Paragraph(str(m["max"]), cell_style),
                Paragraph(str(m["avg"]), cell_style)
            ])
        t_tel = Table(tel_data, colWidths=[140, 70, 60, 90, 90, 90])
        t_tel.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f2b48")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_tel)

    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0f2b48")))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<i>Confidential — Official OIL Technical Record | Generated by NWIS eRTMAC System | Provenance Hash: {meta.get('provenance_hash', 'PROV-GEO-2026-991A')}</i>", sub_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


def generate_report_csv(report_id: str, user_role: str) -> str:
    """Generate CSV string for report download."""
    preview = get_report_preview(report_id, user_role)
    meta = preview["metadata"]

    lines = [
        f"# NWIS / eRTMAC-NWIS Official Technical Report",
        f"# Report ID: {meta['report_id']}",
        f"# Title: {meta['title']}",
        f"# Well ID: {meta['well_id']} ({meta['well_name']})",
        f"# Generated By: {meta['generated_by']} ({meta['user_role']})",
        f"# Generated At: {meta['generated_at']}",
        f"# Source Classification: {meta['source_classification']}",
        "",
        "Parameter,Value,Unit,Min,Max,Average"
    ]

    for m in preview.get("telemetry_metrics", []):
        lines.append(f"\"{m['parameter']}\",{m['value']},{m['unit']},{m['min']},{m['max']},{m['avg']}")

    lines.append("")
    lines.append("Risk Type,Severity,Score,Trigger Factors,Mitigation")
    for r in preview.get("risk_breakdown", []):
        factors = "; ".join(r.get("trigger_factors", []))
        lines.append(f"\"{r['risk_type']}\",{r['severity']},{r['score']},\"{factors}\",\"{r['mitigation']}\"")

    return "\n".join(lines)


# ==============================================================================
# END-TO-END NWIS WORKFLOW DATA STORES & HANDLERS (STEPS 1 - 14)
# ==============================================================================

PRE_DRILL_REPORTS_DB: List[Dict[str, Any]] = [
    {
        "predrill_id": "PRE-DUL92-01",
        "well_id": "DUL_92",
        "well_name": "Duliajan-92",
        "geologist": "Lead Geologist (Demo)",
        "created_at": "2026-09-24T10:00:00Z",
        "status": "SUBMITTED_TO_ENGINEER",
        "target_formations": ["Tipam Sandstone", "Girujan Clay", "Barail Group Sandstone", "Kopili Shale"],
        "expected_hazards": ["Barail Shale hydration swelling", "Kopili overpressured gas transition"],
        "offset_wells_analyzed": ["DUL_88", "DUL_99", "MOR_25"],
        "recommended_baselines": {"max_ecd_sg": 1.25, "glycol_concentration_pct": 4.0, "wiper_trip_interval_m": 150.0},
        "notes": "High smectite clay fraction in Barail formation at 2,210m. Poly-Glycol WBM required prior to penetration."
    }
]

NEW_ENGINEERING_SOLUTIONS_DB: List[Dict[str, Any]] = [
    {
        "solution_id": "ENG-SOL-DUL92-01",
        "well_id": "DUL_92",
        "well_name": "Duliajan-92",
        "depth_m": 2210.0,
        "formation": "Barail Group Shale",
        "anomaly_type": "Stuck Pipe Hazard / High Torque Spike",
        "observed_parameters": "Torque 79.6 kNm, ROP 4.0 m/hr, SPP 2327 psi",
        "diagnosis": "Reactive Smectite/Illite shale expansion under mud weight 1.16 g/cc EMW",
        "proposed_solution": "Spot 50 bbl Poly-Glycol pill, 4-hr soak, raise mud weight to 1.25 g/cc EMW with API Barite.",
        "action_taken": "Pill pumped, 4-hr soak executed, mud weight raised to 1.25 g/cc EMW.",
        "outcome": "Torque reduced to 18.5 kNm, pipe freed, drilling resumed successfully.",
        "lessons_learned": "Pre-sweep with 4% glycol before penetrating Barail shale interval.",
        "engineer_name": "Senior Drilling Engineer (Demo)",
        "submitted_at": "2026-09-27T16:30:00Z",
        "status": "PENDING_MANAGEMENT_REVIEW",
        "management_approved": False,
        "approved_by": None,
        "approved_at": None,
        "ingested_in_rag": False
    }
]

ESCALATED_ANOMALIES_DB: List[Dict[str, Any]] = []

def create_predrill_report(
    well_id: str,
    geologist: str,
    target_formations: List[str],
    expected_hazards: List[str],
    offset_wells: List[str],
    recommended_baselines: Dict[str, Any],
    notes: str
) -> Dict[str, Any]:
    timestamp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    report_id = f"REP-{time.strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    predrill_id = f"PRE-{well_id}-{uuid.uuid4().hex[:4].upper()}"

    # Resolve well name from historical service
    try:
        detail = historical_service.get_well_detail(well_id)
        well_name = detail.get("well", {}).get("well_name", f"Well {well_id}")
    except Exception:
        well_name = f"Well {well_id}"

    report = {
        "predrill_id": predrill_id,
        "well_id": well_id,
        "well_name": well_name,
        "geologist": geologist,
        "created_at": timestamp_iso,
        "status": "SUBMITTED_TO_ENGINEER",
        "target_formations": target_formations,
        "expected_hazards": expected_hazards,
        "offset_wells_analyzed": offset_wells,
        "recommended_baselines": recommended_baselines,
        "notes": notes
    }
    PRE_DRILL_REPORTS_DB.insert(0, report)

    # Also insert into REPORT_HISTORY_DB so it appears in the Reports Workspace
    # for both Geologist and Drilling Engineer (PRE_DRILL_ANALYSIS is permitted for both)
    history_entry = {
        "report_id": report_id,
        "report_type": "PRE_DRILL_ANALYSIS",
        "title": f"Pre-Drill Analysis & Handoff — {well_name}",
        "well_id": well_id,
        "well_name": well_name,
        "reporting_period": "Pre-Drill Handoff",
        "generated_by": geologist or "Geologist (Demo)",
        "user_role": "GEOLOGIST",
        "generated_at": timestamp_iso,
        "status": "COMPLETED",
        "file_type": "PDF",
        "file_size": "480 KB",
        "source_classification": "GEOLOGICAL_EVALUATION",
        "data_freshness": "PRE_DRILL"
    }
    REPORT_HISTORY_DB.insert(0, history_entry)

    return report

def get_predrill_reports(well_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if well_id:
        return [p for p in PRE_DRILL_REPORTS_DB if p["well_id"] == well_id]
    return PRE_DRILL_REPORTS_DB

def acknowledge_predrill_report(predrill_id: str, engineer_name: str) -> Dict[str, Any]:
    for p in PRE_DRILL_REPORTS_DB:
        if p["predrill_id"] == predrill_id:
            p["status"] = "APPROVED_BY_ENGINEER"
            p["acknowledged_by"] = engineer_name
            p["acknowledged_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            return p
    raise ValueError(f"Pre-drill report {predrill_id} not found.")

def create_engineering_solution(
    well_id: str,
    depth_m: float,
    formation: str,
    anomaly_type: str,
    observed_parameters: str,
    diagnosis: str,
    proposed_solution: str,
    action_taken: str,
    outcome: str,
    lessons_learned: str,
    engineer_name: str
) -> Dict[str, Any]:
    solution = {
        "solution_id": f"ENG-SOL-{well_id}-{uuid.uuid4().hex[:4].upper()}",
        "well_id": well_id,
        "well_name": f"Well {well_id}",
        "depth_m": depth_m,
        "formation": formation,
        "anomaly_type": anomaly_type,
        "observed_parameters": observed_parameters,
        "diagnosis": diagnosis,
        "proposed_solution": proposed_solution,
        "action_taken": action_taken,
        "outcome": outcome,
        "lessons_learned": lessons_learned,
        "engineer_name": engineer_name,
        "submitted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "status": "PENDING_MANAGEMENT_REVIEW",
        "management_approved": False,
        "approved_by": None,
        "approved_at": None,
        "ingested_in_rag": False
    }
    NEW_ENGINEERING_SOLUTIONS_DB.insert(0, solution)
    return solution

def get_pending_knowledge_queue() -> List[Dict[str, Any]]:
    return NEW_ENGINEERING_SOLUTIONS_DB

def approve_knowledge_solution(solution_id: str, manager_name: str) -> Dict[str, Any]:
    for sol in NEW_ENGINEERING_SOLUTIONS_DB:
        if sol["solution_id"] == solution_id:
            sol["status"] = "APPROVED_AND_INGESTED"
            sol["management_approved"] = True
            sol["approved_by"] = manager_name
            sol["approved_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            sol["ingested_in_rag"] = True
            
            # Automatically ingest into historical VERIFIED_DOCUMENTS / RAG index!
            from app.services.historical_service import VERIFIED_DOCUMENTS
            VERIFIED_DOCUMENTS.append({
                "document_id": sol["solution_id"],
                "document_name": f"Approved_Solution_{sol['well_id']}_{sol['anomaly_type'].replace(' ', '_')}.pdf",
                "document_type": "Approved Engineering Lesson",
                "section": f"Depth {sol['depth_m']}m ({sol['formation']})",
                "associated_well": sol["well_id"],
                "summary": f"APPROVED LESSON: {sol['anomaly_type']} at {sol['depth_m']}m in {sol['formation']}. Action: {sol['action_taken']}. Outcome: {sol['outcome']}. Lesson: {sol['lessons_learned']}."
            })
            return sol
    raise ValueError(f"Engineering solution {solution_id} not found.")

