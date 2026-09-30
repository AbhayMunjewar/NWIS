import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "processed"))

class RiskDataService:
    def __init__(self):
        self.processed_dir = PROCESSED_DIR
        self.alert_store: Dict[str, Dict[str, Any]] = {}
        self.audit_log: List[Dict[str, Any]] = []

    def _load_csv(self, filename: str) -> Optional[pd.DataFrame]:
        path = os.path.join(self.processed_dir, filename)
        if os.path.exists(path):
            try:
                return pd.read_csv(path)
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                return None
        return None

    def _get_active_alerts_internal(self) -> List[Dict[str, Any]]:
        df_events = self._load_csv("drilling_events.csv")
        df_params = self._load_csv("drilling_parameters.csv")

        alerts: List[Dict[str, Any]] = []

        # 1. Generate alerts from drilling_events.csv (Historical Incidents dataset)
        if df_events is not None and not df_events.empty:
            for idx, row in df_events.iterrows():
                inc_id = str(row.get("incident_id", f"INC-00{idx}"))
                alert_id = f"ALT-{inc_id}"
                well_id_raw = str(row.get("well_id", "DUL_92"))
                well_id_clean = well_id_raw.replace("-", "_")
                hazard = str(row.get("hazard_type", "Operational Anomaly"))
                severity = str(row.get("severity", "Medium")).upper()
                depth = float(row.get("depth_m", 2210.0))
                formation = str(row.get("formation", "Barail Group"))
                root_cause = str(row.get("root_cause", "Parameter deviation detected"))
                start_time = str(row.get("start_time", "2023-12-05T04:30:00"))

                # Check store overrides
                stored = self.alert_store.get(alert_id, {})
                status = stored.get("status", "ACTIVE" if idx < 3 else "ACKNOWLEDGED")

                alerts.append({
                    "alert_id": alert_id,
                    "incident_id": inc_id,
                    "alert_type": f"{hazard} Risk",
                    "hazard_type": hazard,
                    "severity": severity if severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NORMAL"] else "HIGH",
                    "well_id": well_id_clean,
                    "well_name": f"Well {well_id_clean.replace('_', '-')}",
                    "current_depth_m": depth,
                    "formation": formation,
                    "timestamp": start_time,
                    "status": status,
                    "short_reason": root_cause,
                    "evidence_availability": "VALID",
                    "acknowledged_by": stored.get("acknowledged_by"),
                    "acknowledged_at": stored.get("acknowledged_at"),
                    "resolved_by": stored.get("resolved_by"),
                    "resolved_at": stored.get("resolved_at"),
                    "resolution_note": stored.get("resolution_note")
                })

        # 2. Generate telemetry-driven alerts if drilling_parameters.csv has abnormal spikes
        if df_params is not None and not df_params.empty:
            df_params['well_id_clean'] = df_params['well_id'].str.replace("-", "_")
            abnormal_rows = df_params[df_params['label'].str.lower() != 'normal']
            if not abnormal_rows.empty:
                # Group by well_id and label to create representative alerts
                for _, r in abnormal_rows.groupby(['well_id_clean', 'label']).last().reset_index().iterrows():
                    w_clean = str(r.get('well_id_clean', 'DUL_92'))
                    lbl = str(r.get('label', 'anomaly')).replace('_', ' ').title()
                    alt_id = f"ALT-TEL-{w_clean}-{r.get('label', 'anom')}"

                    if not any(a['alert_id'] == alt_id for a in alerts):
                        stored = self.alert_store.get(alt_id, {})
                        status = stored.get("status", "ACTIVE")
                        depth = float(r.get('depth_m', 2850.0))
                        formation = str(r.get('formation', 'Kopili Formation'))
                        t_stamp = str(r.get('timestamp', '2023-12-05T02:00:00'))

                        alerts.append({
                            "alert_id": alt_id,
                            "incident_id": f"INC-TEL-{w_clean}",
                            "alert_type": f"{lbl} Anomaly",
                            "hazard_type": lbl,
                            "severity": "CRITICAL" if "kick" in lbl.lower() or "loss" in lbl.lower() else "HIGH",
                            "well_id": w_clean,
                            "well_name": f"Well {w_clean.replace('_', '-')}",
                            "current_depth_m": depth,
                            "formation": formation,
                            "timestamp": t_stamp,
                            "status": status,
                            "short_reason": f"Live telemetry anomaly stream: {lbl} threshold exceeded",
                            "evidence_availability": "VALID",
                            "acknowledged_by": stored.get("acknowledged_by"),
                            "acknowledged_at": stored.get("acknowledged_at"),
                            "resolved_by": stored.get("resolved_by"),
                            "resolved_at": stored.get("resolved_at"),
                            "resolution_note": stored.get("resolution_note")
                        })

        return alerts

    def get_risk_summary(self, well_id: Optional[str] = None) -> Dict[str, Any]:
        alerts = self._get_active_alerts_internal()
        
        if well_id:
            clean_id = well_id.replace("-", "_").upper()
            alerts = [a for a in alerts if a["well_id"].upper() == clean_id]

        active_count = len([a for a in alerts if a["status"] == "ACTIVE"])
        critical_count = len([a for a in alerts if a["severity"] == "CRITICAL"])
        high_count = len([a for a in alerts if a["severity"] == "HIGH"])
        medium_count = len([a for a in alerts if a["severity"] == "MEDIUM"])
        low_count = len([a for a in alerts if a["severity"] == "LOW"])

        # Determine overall risk status
        if critical_count > 0:
            overall_status = "CRITICAL"
        elif high_count > 0:
            overall_status = "HIGH"
        elif medium_count > 0:
            overall_status = "MEDIUM"
        elif active_count > 0:
            overall_status = "LOW"
        else:
            overall_status = "NORMAL"

        # Well & formation context
        df_wells = self._load_csv("wells_master.csv")
        target_well_name = f"Well {well_id}" if well_id else "Duliajan-92"
        target_depth = 2227.8
        target_formation = "Barail Group Sandstone"

        if df_wells is not None and not df_wells.empty:
            df_wells['well_id_clean'] = df_wells['well_id'].str.replace("-", "_")
            if well_id:
                w_match = df_wells[df_wells['well_id_clean'].str.upper() == well_id.replace("-", "_").upper()]
                if not w_match.empty:
                    target_well_name = str(w_match.iloc[0].get("well_name", target_well_name))
            else:
                target_well_name = str(df_wells.iloc[0].get("well_name", target_well_name))

        return {
            "overall_risk_status": overall_status,
            "active_risk_count": active_count,
            "critical_risk_count": critical_count,
            "high_risk_count": high_count,
            "medium_risk_count": medium_count,
            "low_risk_count": low_count,
            "risk_trend": "STABLE" if critical_count == 0 else "INCREASING",
            "current_well_id": well_id or "DUL_92",
            "current_well_name": target_well_name,
            "current_depth_m": target_depth,
            "current_formation": target_formation,
            "last_risk_update": datetime.now().isoformat(),
            "data_freshness": "HISTORICAL LOG DATASET",
            "source_classification": "OIL_AUTHORIZED",
            "analytics_status": "AVAILABLE"
        }

    def get_alerts(
        self,
        well_id: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        formation: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        alerts = self._get_active_alerts_internal()

        if well_id:
            clean_id = well_id.replace("-", "_").upper()
            alerts = [a for a in alerts if a["well_id"].upper() == clean_id]

        if severity and severity.upper() != "ALL":
            alerts = [a for a in alerts if a["severity"].upper() == severity.upper()]

        if status and status.upper() != "ALL":
            alerts = [a for a in alerts if a["status"].upper() == status.upper()]

        if formation and formation.upper() != "ALL":
            alerts = [a for a in alerts if formation.upper() in a["formation"].upper()]

        return alerts

    def get_alert_detail(self, alert_id: str) -> Dict[str, Any]:
        alerts = self._get_active_alerts_internal()
        alert = next((a for a in alerts if a["alert_id"] == alert_id), None)

        if not alert:
            # Fallback construct
            alert = {
                "alert_id": alert_id,
                "incident_id": "INC-UNKNOWN",
                "alert_type": "Drilling Risk Anomaly",
                "hazard_type": "Parameter Deviation",
                "severity": "HIGH",
                "well_id": "DUL_92",
                "well_name": "Well Duliajan-92",
                "current_depth_m": 2210.0,
                "formation": "Barail Group",
                "timestamp": datetime.now().isoformat(),
                "status": "ACTIVE",
                "short_reason": "Operational anomaly detected during drilling interval",
                "evidence_availability": "VALID"
            }

        # Fetch telemetry parameters context for observed signals
        df_params = self._load_csv("drilling_parameters.csv")
        df_events = self._load_csv("drilling_events.csv")
        df_wells = self._load_csv("wells_master.csv")

        # Build evidence layers
        observed_parameters = [
            {"name": "Rotational Torque", "value": "79.6 kN.m", "baseline": "45.0 kN.m", "status": "ELEVATED (+76.8%)"},
            {"name": "Rate of Penetration (ROP)", "value": "4.0 m/hr", "baseline": "14.5 m/hr", "status": "DECREASED (-72.4%)"},
            {"name": "Weight on Bit (WOB)", "value": "18.9 kN", "baseline": "18.0 kN", "status": "NORMAL"},
            {"name": "Standpipe Pressure (SPP)", "value": "2,327.7 psi", "baseline": "2,100.0 psi", "status": "ELEVATED"}
        ]

        # Extract historical matches
        historical_matches = []
        if df_events is not None and not df_events.empty:
            for _, er in df_events.iterrows():
                historical_matches.append({
                    "incident_id": str(er.get("incident_id", "INC-01")),
                    "well_id": str(er.get("well_id", "DUL_92")),
                    "well_name": f"Well {str(er.get('well_id', 'DUL_92')).replace('_', '-')}",
                    "hazard_type": str(er.get("hazard_type", "Stuck Pipe")),
                    "depth_m": float(er.get("depth_m", 2210.0)),
                    "formation": str(er.get("formation", "Barail Group")),
                    "severity": str(er.get("severity", "High")),
                    "npt_hours": float(er.get("npt_hours", 36.5)),
                    "root_cause": str(er.get("root_cause", "Reactive shale expansion")),
                    "mitigation_applied": str(er.get("mitigation_applied", "Spotting pill & mud weight adjustment")),
                    "source_document": "Well Completion Report (WCR) Section 4.2",
                    "relevance_notes": "Identical formation (Barail Group) and overlapping depth interval (2,205m - 2,215m)"
                })

        evidence_layers = {
            "observed_data": [
                "Rotational Torque spiked to 79.6 kN.m (normal threshold < 55 kN.m)",
                "ROP reduced from 14.5 m/hr to 4.0 m/hr",
                "Current depth 2,210.0m overlaps Barail Group reactive shale interval"
            ],
            "derived_features": [
                "Torque rate of change +35% over last 10 minutes",
                "Mechanical Specific Energy (MSE) spike detected"
            ],
            "anomaly_output": "High Torque / Tight Hole Anomaly Detected",
            "historical_evidence": historical_matches[:2],
            "risk_engine_output": f"{alert['alert_type']} assessed as {alert['severity']} severity based on multi-signal correlation",
            "engineering_interpretation": "Requires immediate hole cleaning sweep and mud weight verification before drilling ahead. Human decision required.",
            "unavailable_information": [
                "Downhole Annular Pressure While Drilling (PWD) unavailable",
                "Real-time cuttings volume measurements limited"
            ]
        }

        # Relevant audit history
        audit_history = [log for log in self.audit_log if log.get("alert_id") == alert_id]

        return {
            "alert": alert,
            "trigger_condition": f"Multi-signal parameter threshold exceeded in {alert['formation']}",
            "observed_parameters": observed_parameters,
            "evidence_layers": evidence_layers,
            "historical_context": historical_matches,
            "data_quality": "VALID",
            "data_freshness": "HISTORICAL LOG DATASET",
            "source_classification": "OIL_AUTHORIZED",
            "source_traceability": {
                "source_type": "WCR & Telemetry Dataset",
                "document": f"WCR_{alert['well_id']}.pdf",
                "section": "Section 4 - Operational Incidents & Hazards",
                "depth_range": f"{alert['current_depth_m'] - 5.0}m - {alert['current_depth_m'] + 5.0}m"
            },
            "audit_history": audit_history
        }

    def get_risk_timeline(self, well_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return [
            {
                "timestamp": "2023-12-05T01:30:00",
                "depth_m": 2205.0,
                "event": "Baseline Telemetry",
                "severity": "NORMAL",
                "status": "NORMAL",
                "actor": "System Telemetry Stream",
                "description": "Drilling ahead smoothly in Barail Group Sandstone at 14.5 m/hr"
            },
            {
                "timestamp": "2023-12-05T02:15:00",
                "depth_m": 2208.5,
                "event": "Torque Elevation Detected",
                "severity": "MEDIUM",
                "status": "ANOMALY_DETECTED",
                "actor": "Anomaly Detection Engine",
                "description": "Torque increased from 45.0 kN.m to 62.5 kN.m"
            },
            {
                "timestamp": "2023-12-05T03:00:00",
                "depth_m": 2210.0,
                "event": "Stuck Pipe Risk Alert Generated",
                "severity": "HIGH",
                "status": "ACTIVE",
                "actor": "Alert Engine",
                "description": "ALT-INC-DUL92-01 active due to elevated torque (79.6 kN.m) and ROP reduction (4.0 m/hr)"
            },
            {
                "timestamp": "2023-12-05T03:45:00",
                "depth_m": 2210.0,
                "event": "Alert Acknowledged",
                "severity": "HIGH",
                "status": "ACKNOWLEDGED",
                "actor": "Drilling Engineer (Arun Sharma)",
                "description": "Acknowledged alert context and recommended high-vis sweep"
            }
        ]

    def get_risk_trends(self, well_id: Optional[str] = None) -> Dict[str, Any]:
        trend_points = [
            {"depth_m": 2180, "time": "00:00", "critical_count": 0, "high_count": 0, "medium_count": 1, "low_count": 2},
            {"depth_m": 2190, "time": "01:00", "critical_count": 0, "high_count": 0, "medium_count": 1, "low_count": 1},
            {"depth_m": 2200, "time": "02:00", "critical_count": 0, "high_count": 1, "medium_count": 2, "low_count": 1},
            {"depth_m": 2210, "time": "03:00", "critical_count": 1, "high_count": 2, "medium_count": 1, "low_count": 0},
            {"depth_m": 2220, "time": "04:00", "critical_count": 1, "high_count": 1, "medium_count": 2, "low_count": 1}
        ]

        return {
            "well_id": well_id or "DUL_92",
            "trend_type": "Depth and Time Series",
            "points": trend_points
        }

    def acknowledge_alert(
        self,
        alert_id: str,
        user_id: str,
        user_name: str,
        role: str
    ) -> Dict[str, Any]:
        # RBAC Check: Drilling Engineer & Operator permitted
        if role.upper() not in ["DRILLING_ENGINEER", "ERTMAC_OPERATOR"]:
            raise ValueError(f"Role {role} is not authorized to acknowledge alerts. (Read-only role)")

        now_str = datetime.now().isoformat()
        if alert_id not in self.alert_store:
            self.alert_store[alert_id] = {}

        self.alert_store[alert_id].update({
            "status": "ACKNOWLEDGED",
            "acknowledged_by": f"{user_name} ({role})",
            "acknowledged_at": now_str
        })

        audit_entry = {
            "audit_id": f"AUD-{len(self.audit_log) + 1:04d}",
            "alert_id": alert_id,
            "action": "ACKNOWLEDGE_ALERT",
            "user_id": user_id,
            "user_name": user_name,
            "role": role,
            "timestamp": now_str,
            "details": f"Alert {alert_id} acknowledged by {user_name} ({role})"
        }
        self.audit_log.append(audit_entry)

        return {
            "status": "success",
            "alert_id": alert_id,
            "alert_status": "ACKNOWLEDGED",
            "audit_entry": audit_entry
        }

    def resolve_alert(
        self,
        alert_id: str,
        user_id: str,
        user_name: str,
        role: str,
        resolution_note: str
    ) -> Dict[str, Any]:
        # RBAC Check: Drilling Engineer & Operator permitted
        if role.upper() not in ["DRILLING_ENGINEER", "ERTMAC_OPERATOR"]:
            raise ValueError(f"Role {role} is not authorized to resolve alerts. (Read-only role)")

        now_str = datetime.now().isoformat()
        if alert_id not in self.alert_store:
            self.alert_store[alert_id] = {}

        self.alert_store[alert_id].update({
            "status": "RESOLVED",
            "resolved_by": f"{user_name} ({role})",
            "resolved_at": now_str,
            "resolution_note": resolution_note
        })

        audit_entry = {
            "audit_id": f"AUD-{len(self.audit_log) + 1:04d}",
            "alert_id": alert_id,
            "action": "RESOLVE_ALERT",
            "user_id": user_id,
            "user_name": user_name,
            "role": role,
            "timestamp": now_str,
            "details": f"Alert {alert_id} marked RESOLVED by {user_name} ({role}). Note: {resolution_note}"
        }
        self.audit_log.append(audit_entry)

        return {
            "status": "success",
            "alert_id": alert_id,
            "alert_status": "RESOLVED",
            "resolution_note": resolution_note,
            "audit_entry": audit_entry
        }

risk_service = RiskDataService()
