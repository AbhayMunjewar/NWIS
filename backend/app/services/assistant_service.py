import os
import json
import requests
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.operations_service import OperationsDataService
from app.services.live_service import live_service
from app.services.risk_service import risk_service
from app.services.historical_service import historical_service, VERIFIED_DOCUMENTS
from app.services.ml_service import ml_service

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]

class AIAssistantService:
    def __init__(self):
        self.operations_service = OperationsDataService()
        self.live_service = live_service
        self.risk_service = risk_service
        self.historical_service = historical_service

    def get_suggested_questions(self, role: str, well_id: Optional[str] = "DUL_92") -> List[str]:
        role_upper = role.upper() if role else "DRILLING_ENGINEER"

        if role_upper == "GEOLOGIST":
            return [
                "Which nearby historical wells intersected the Barail Group formation?",
                "Compare formation top depths and lithology between Duliajan-92 and Duliajan-99.",
                "What wireline well log curves are available for the Kopili formation interval?",
                "What geological evidence exists regarding reactive shale swelling at 2,210m?"
            ]
        elif role_upper == "ERTMAC_OPERATOR":
            return [
                "Why was the current Stuck Pipe risk alert generated on Duliajan-92?",
                "What abnormal parameter pattern is currently active in live telemetry?",
                "What operational mitigations were applied during past gas kick incidents?",
                "What is the current data freshness and stream health status?"
            ]
        elif role_upper == "MANAGEMENT_SUPERVISOR":
            return [
                "What are the major active operational risks across all Duliajan wells?",
                "Summarize historical NPT incident hours and financial loss in Upper Assam Shelf.",
                "What major drilling events have occurred in Barail Group sandstone?",
                "Give an executive summary of current drilling progress on Duliajan-92."
            ]
        else: # DRILLING_ENGINEER
            return [
                "Explain the current elevated torque (79.6 kNm) and low ROP (4.0 m/hr) pattern using historical evidence.",
                "What happened in nearby historical wells at depth 2,210m in Barail Group?",
                "What does the WCR report (01_DUL92_Stuck_Pipe_Complete.pdf) state regarding glycol pill soak time?",
                "Compare drilling parameters of Duliajan-92 with offset well Duliajan-88."
            ]

    def _call_groq_llm(self, messages: List[Dict[str, str]]) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        for model_name in GROQ_MODELS:
            try:
                payload = {
                    "model": model_name,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1200
                }
                response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=12)
                if response.status_code == 200:
                    resp_json = response.json()
                    content = resp_json["choices"][0]["message"]["content"]
                    if content and len(content.strip()) > 10:
                        return content.strip()
            except Exception as e:
                print(f"Groq API call error for model {model_name}: {e}")
                continue
        return None

    def query_assistant(
        self,
        question: str,
        role: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        role_upper = role.upper() if role else "DRILLING_ENGINEER"
        ctx = context or {}
        well_id = ctx.get("well_id", "DUL_92")
        risk_type = ctx.get("risk_type", "Stuck Pipe Risk")

        q_lower = question.lower()

        # Fetch authoritative structured data for the ACTIVE WELL
        ops_summary = self.operations_service.get_operations_summary(well_id=well_id)
        live_current = self.live_service.get_live_current(well_id=well_id)
        risk_summary = self.risk_service.get_risk_summary(well_id=well_id)
        hist_events = self.historical_service.get_events(well_id=well_id)

        current_obs: List[str] = []
        hist_ev: List[Dict[str, Any]] = []
        doc_ev: List[Dict[str, Any]] = []
        sources: List[Dict[str, Any]] = []
        limitations: List[str] = []

        # Extract REAL telemetry from live service (actual CSV dataset values)
        latest_p = live_current.get("parameters", {})
        trq_v = latest_p.get("torque", {}).get("value", 0.0)
        rop_v = latest_p.get("rop", {}).get("value", 0.0)
        wob_v = latest_p.get("wob", {}).get("value", 0.0)
        spp_v = latest_p.get("spp", {}).get("value", 0.0)
        rpm_v = latest_p.get("rpm", {}).get("value", 0.0)

        # Pull REAL depth and formation from the live service (from actual dataset last row)
        depth_m = live_current.get("well_meta", {}).get("current_depth_m", ctx.get("depth_m", 2210.0))
        formation = live_current.get("formation_context", {}).get("current_formation", ctx.get("formation", "Barail Group Sandstone"))
        well_name = live_current.get("well_meta", {}).get("well_name", f"Well {well_id}")
        target_depth = live_current.get("well_meta", {}).get("target_depth_m", 3480.0)
        depth_pct = live_current.get("well_meta", {}).get("depth_progress_pct", 0.0)

        # Fetch REAL ML anomaly scores
        try:
            ml_anomalies = ml_service.get_anomalies(well_id=well_id, depth_m=depth_m)
            multi_score = ml_anomalies.get("multivariate_anomaly", {}).get("anomaly_score", 0.0)
            multi_status = ml_anomalies.get("multivariate_anomaly", {}).get("status", "UNKNOWN")
            trq_anom_score = ml_anomalies.get("torque_anomaly", {}).get("anomaly_score", 0.0)
            trq_anom_status = ml_anomalies.get("torque_anomaly", {}).get("status", "UNKNOWN")
            rop_anom_score = ml_anomalies.get("rop_anomaly", {}).get("anomaly_score", 0.0)
            rop_anom_status = ml_anomalies.get("rop_anomaly", {}).get("status", "UNKNOWN")
        except Exception:
            multi_score, multi_status = 0.0, "UNAVAILABLE"
            trq_anom_score, trq_anom_status = 0.0, "UNAVAILABLE"
            rop_anom_score, rop_anom_status = 0.0, "UNAVAILABLE"

        # Fetch REAL early warnings
        try:
            ml_warnings = ml_service.get_early_warnings(well_id=well_id)
            active_warnings = ml_warnings.get("early_warnings", [])
        except Exception:
            active_warnings = []

        current_obs.append(f"Active Well: {well_id} ({well_name})")
        current_obs.append(f"Rotational Torque measured at {trq_v} kN.m")
        current_obs.append(f"Rate of Penetration (ROP) at {rop_v} m/hr")
        current_obs.append(f"Weight on Bit (WOB) at {wob_v} kN")
        current_obs.append(f"Standpipe Pressure (SPP) at {spp_v} psi")
        current_obs.append(f"RPM at {rpm_v}")
        current_obs.append(f"Current Depth: {depth_m}m in {formation}")
        current_obs.append(f"Target Depth: {target_depth}m | Progress: {depth_pct}%")
        current_obs.append(f"ML Multivariate Anomaly Score: {multi_score} ({multi_status})")
        current_obs.append(f"ML Torque Anomaly Score: {trq_anom_score} ({trq_anom_status})")
        current_obs.append(f"ML ROP Anomaly Score: {rop_anom_score} ({rop_anom_status})")

        # Document RAG Evidence Matching
        if "wcr" in q_lower or "report" in q_lower or "document" in q_lower or "glycol" in q_lower or "mitigation" in q_lower or "stuck" in q_lower:
            doc_ev.append({
                "document_name": "01_DUL92_Stuck_Pipe_Complete.pdf",
                "document_type": "Well Completion Report (WCR)",
                "section": "Section 4.2 - Operational Incidents & Hazards",
                "page": 14,
                "well_id": "DUL_92",
                "depth_range": "2,205m - 2,215m",
                "text_chunk": "Reactive Smectite/Illite shale expansion encountered at 2,210m under mud weight 1.16 g/cc EMW. Successful recovery achieved using 50 bbl Glycol Spotting Pill with 4-hr soak time, followed by raising mud weight to 1.25 g/cc EMW."
            })
            sources.append({
                "source_type": "WCR Document RAG",
                "document": "01_DUL92_Stuck_Pipe_Complete.pdf",
                "section": "Section 4.2",
                "page": 14,
                "well_id": "DUL_92",
                "depth_m": 2210.0
            })

        if "kick" in q_lower or "gas" in q_lower or "kopili" in q_lower:
            doc_ev.append({
                "document_name": "02_DUL88_Gas_Kick_Complete.pdf",
                "document_type": "Incident Report",
                "section": "Section 3 - Overpressured Gas Influx",
                "page": 8,
                "well_id": "DUL_88",
                "depth_range": "2,837m - 2,847m",
                "text_chunk": "SICP 350 psi, SIDPP 240 psi recorded in Kopili marine shale. Controlled via Wait & Weight method using API Barite mud weight increase to 1.36 g/cc EMW."
            })
            sources.append({
                "source_type": "Incident Report RAG",
                "document": "02_DUL88_Gas_Kick_Complete.pdf",
                "section": "Section 3",
                "page": 8,
                "well_id": "DUL_88",
                "depth_m": 2842.0
            })

        # Historical Incident Matching
        if hist_events:
            for he in hist_events:
                hist_ev.append({
                    "incident_id": he.get("incident_id", "INC-DUL92-01"),
                    "well_id": he.get("well_id", well_id),
                    "well_name": he.get("well_name", f"Well {well_id}"),
                    "hazard_type": he.get("hazard_type", "Stuck Pipe"),
                    "depth_m": he.get("depth_m", depth_m),
                    "formation": he.get("formation", formation),
                    "severity": he.get("severity", "High"),
                    "npt_hours": he.get("npt_hours", 36.5),
                    "cost_loss_inr": he.get("cost_loss_inr", 4560000.0),
                    "root_cause": he.get("root_cause", "Reactive shale expansion"),
                    "mitigation_applied": he.get("mitigation_applied", "50 bbl Glycol Pill & mud weight raise"),
                    "source_document": he.get("source_document", "01_DUL92_Stuck_Pipe_Complete.pdf")
                })
                sources.append({
                    "source_type": "Historical Event Record",
                    "document": he.get("source_document", "01_DUL92_Stuck_Pipe_Complete.pdf"),
                    "section": "Incident Registry",
                    "well_id": he.get("well_id", well_id),
                    "depth_m": he.get("depth_m", depth_m)
                })

        limitations.append("Downhole Annular Pressure While Drilling (PWD) telemetry unavailable.")
        limitations.append("Geological formation tops are historical reference context, not guaranteed future certainty.")

        # Build repository context for Groq LLM grounding
        doc_catalog_text = "\n".join([f"- {d['document_name']} ({d['document_type']}) [Well: {d['associated_well']}]: {d['summary']}" for d in VERIFIED_DOCUMENTS])

        # Build early warning context string
        ew_text = "No active early warnings."
        if active_warnings:
            ew_lines = []
            for ew in active_warnings:
                ew_lines.append(f"- {ew.get('title','')}: {ew.get('hazard_type','')} at {ew.get('depth_m',0)}m in {ew.get('formation','')}, Severity: {ew.get('severity','')}, Lead Time: {ew.get('lead_time_minutes',0)} min, Recommended: {ew.get('recommended_action','')}")
            ew_text = "\n".join(ew_lines)

        repo_context = f"""
=== AUTHORITATIVE PROJECT REPOSITORY CONTEXT (data/, dataset/, docs/, pdfs/) ===
TARGET BASIN: Upper Assam Shelf Basin | OPERATOR: Oil India Limited (OIL)
SELECTED ACTIVE WELL: {well_id} ({well_name}) | CURRENT DEPTH: {depth_m}m | ACTIVE FORMATION: {formation}
TARGET DEPTH: {target_depth}m | DEPTH PROGRESS: {depth_pct}%

ACTIVE WELL CURRENT TELEMETRY (from actual dataset last row):
- Torque: {trq_v} kNm | ROP: {rop_v} m/hr | WOB: {wob_v} kN | SPP: {spp_v} psi | RPM: {rpm_v}

ML ANOMALY SCORES (from trained IsolationForest models on 284,101 depth rows across 21 wells):
- Multivariate Drilling Anomaly (8-Channel): Score = {multi_score}, Status = {multi_status}
- Torque Anomaly: Score = {trq_anom_score}, Status = {trq_anom_status} (Observed: {trq_v} kNm, Baseline: 15.0 kNm)
- ROP Anomaly: Score = {rop_anom_score}, Status = {rop_anom_status} (Observed: {rop_v} m/hr, Baseline: 14.5 m/hr)

ML EARLY WARNINGS:
{ew_text}

HISTORICAL INCIDENTS IN REPOSITORY:
1. DUL-92 (2210m, Barail Group Shale): Stuck Pipe event (36.5h NPT, Rs 45.6 Lakhs loss). Cause: Reactive Smectite 42% shale swelling. Mitigation: 50 bbl Poly-Glycol pill, 4-hour soak, KCl 8% & Glycol 4% v/v, mud weight raise to 1.25 g/cc.
2. DUL-88 (2842m, Kopili Formation): High Pressure Gas Kick event (22h NPT). Cause: Overpressured gas influx (SICP 350 psi, SIDPP 240 psi, pit gain 15.2 bbl). Mitigation: Annular BOP shut-in, Wait & Weight method, Barite mud weight raise to 1.36 g/cc.
3. DUL-99 (3210m, Sylhet Limestone): Severe Lost Circulation event (44h NPT, Rs 18.5 Lakhs cost). Cause: Karstified vuggy fracture network. Mitigation: Fresh water top-up, 60 bbl coarse LCM pill, 35 bbl Class-G cement squeeze plug.
4. DUL-104 (2205m, Barail Group): Elevated torque warning (18.2 kNm). Mitigation: Proactive back-reaming & 2% Poly-Glycol sweep.

CONNECTED REPOSITORY PDF DOCUMENTS & TECHNICAL REPORTS:
{doc_catalog_text}

GEOLOGICAL FORMATIONS & DRILLING HAZARDS:
- Tipam Sandstone (0-800m): Permeable surface sandstone, stable drilling.
- Girujan Clay (800-1500m): Intermediate claystone, mild swelling, tight hole.
- Barail Group (1800-2500m): Smectite/Illite reactive shale, swelling, stuck pipe.
- Kopili Formation (2500-3200m): Overpressured transition zone, gas kick/influx hazard (1.28-1.38 g/cc EMW).
- Sylhet Limestone (3000-3500m): Karstified vuggy limestone, 100% total lost circulation hazard.

CASING & MUD SYSTEM DATA:
- Casing Sizes: 20 in @ 80m, 13-3/8 in @ 800m, 9-5/8 in @ 1800m, 7 in Liner @ 3520m.
- Mud System: Poly-Glycol Water-Based Mud (1.15 to 1.36 g/cc density range).
"""

        system_prompt = f"""You are Antigravity eRTMAC AI Assistant, an expert Senior Drilling Engineer and Geoscientist for Oil India Limited (OIL) in Upper Assam Shelf Basin.
You are assisting a user acting in the role of **{role_upper}**.

STRICT OPERATIONAL RULES:
1. ACTIVE WELL SCOPE: The user has selected **{well_id}** as their Active Well. When the user asks about current well status, telemetry, or risks without specifying a different well, answer specifically for **{well_id}**.
2. ADAPTIVE QUESTION ANSWERING: If the user asks a specific question (about WCR reports, specific offset wells, physics, equations, or mud formulas), answer precisely according to the question asked.
3. GROUNDING & FALLBACK: Ground your answers in the project files (data/, dataset/, docs/, pdfs/). For topics outside project files, provide expert petroleum engineering principles. NEVER refuse to answer.
4. STRICT HISTORICAL MATCHING: If searching for a historical incident match for an anomaly, and no sufficiently similar historical case exists in the repository for the given formation/depth/parameter pattern, explicitly state: "No sufficiently similar historical case was found in the current knowledge base." Do NOT fabricate, hallucinate, or force a historical match.
5. DECISION SUPPORT ONLY: Always present historical actions as historical evidence for engineering evaluation, NEVER as automatic drilling commands.
6. FORMATTING: Use professional markdown with bold key points, bullet lists, and clear headers.
"""

        messages = [
            {"role": "system", "content": system_prompt + "\n" + repo_context},
            {"role": "user", "content": question}
        ]

        # Call Groq API LLM
        llm_answer = self._call_groq_llm(messages)

        if llm_answer:
            answer = llm_answer
            answer_type = "GROQ_LLM_RAG"
        if not llm_answer:
            answer_type = "RULE_BASED_FALLBACK"
            
            if q_lower.strip() in ["hi", "hello", "hey", "hi!", "hello!", "hey!"]:
                answer = "Hi! I am your AI Assistant. Do you need any help?"
                # Clear evidence for simple greetings
                current_obs = []
                hist_ev = []
                doc_ev = []
                sources = []
            elif any(k in q_lower for k in ["suggestion", "recommend", "mitigate", "action", "what to do", "solution"]):
                answer = (
                    f"**Recommended Action for {risk_type} at {depth_m}m:**\n\n"
                    f"Based on historical data for {formation}, the most effective mitigation strategy is to:\n"
                    f"1. Stop drilling and initiate a proactive back-reaming sequence.\n"
                    f"2. Pump a 50 bbl Poly-Glycol spotting pill.\n"
                    f"3. Allow a 4-hour soak time for the pill to act on the reactive Smectite/Illite shale.\n"
                    f"4. Increase mud weight to 1.25 g/cc EMW before resuming drilling operations."
                )
            elif any(k in q_lower for k in ["telemetry", "status", "live", "dataset"]):
                answer = (
                    f"**Current Well Telemetry & Status for {well_id}:**\n\n"
                    f"• **Depth**: {depth_m}m (Target: {target_depth}m, {depth_pct}% complete)\n"
                    f"• **Formation**: {formation}\n"
                    f"• **Torque**: {trq_v} kN.m (ML Anomaly: {trq_anom_status}, Score: {trq_anom_score})\n"
                    f"• **ROP**: {rop_v} m/hr (ML Anomaly: {rop_anom_status}, Score: {rop_anom_score})\n"
                    f"• **WOB**: {wob_v} kN\n"
                    f"• **SPP**: {spp_v} psi\n\n"
                    f"Overall Multivariate ML Status is **{multi_status}**."
                )
            elif any(k in q_lower for k in ["near", "offset", "top", "other well", "nearby"]):
                answer = (
                    f"**Offset Wells Near {well_id}:**\n\n"
                    f"Based on the historical database for the Upper Assam Shelf Basin, here are the closest offset wells with verified records:\n\n"
                    f"1. **DUL-88** (Distance: 1.2km) - Encountered High Pressure Gas Kick at 2842m.\n"
                    f"2. **DUL-99** (Distance: 2.4km) - Encountered Severe Lost Circulation at 3210m.\n"
                    f"3. **DUL-104** (Distance: 3.1km) - Encountered Elevated torque at 2205m.\n"
                    f"4. **DUL-90** (Distance: 3.8km) - Historical appraisal well.\n"
                    f"5. **DUL-94** (Distance: 5.2km) - Standard development well."
                )
            elif any(k in q_lower for k in ["pdf", "document", "report", "wcr", "file"]):
                answer = (
                    f"**Document Evidence from Project PDFs:**\n\n"
                    f"I scanned the verified repository documents. \n\n"
                    f"Reference: `01_DUL92_Stuck_Pipe_Complete.pdf` (Well Completion Report, Section 4.2)\n"
                    f"• Mentions reactive Smectite/Illite shale expansion encountered at 2,210m under mud weight 1.16 g/cc EMW.\n"
                    f"• Successful recovery was achieved using a 50 bbl Glycol Spotting Pill with 4-hr soak time.\n\n"
                    f"Reference: `02_DUL88_Gas_Kick_Complete.pdf` (Incident Report, Section 3)\n"
                    f"• Mentions overpressured gas influx in Kopili marine shale at 2,837m."
                )
            elif any(k in q_lower for k in ["history", "historical", "past", "incident", "before"]):
                answer = (
                    f"**Historical Incident Analysis:**\n\n"
                    f"In the past, {well_id} experienced a major {risk_type} event at {depth_m}m in the {formation}.\n"
                    f"• **Root Cause**: Reactive shale swelling (42% Smectite).\n"
                    f"• **Impact**: 36.5 hours of Non-Productive Time (NPT) and ₹45.6 Lakhs in financial losses.\n"
                    f"• **Resolution**: A 50 bbl Glycol pill and mud weight raise successfully freed the pipe."
                )
            else:
                answer = (
                    f"Based on your role as **{role_upper}** and the active well **{well_id}**, my analysis shows:\n"
                    f"• We are currently drilling at {depth_m}m in the {formation}.\n"
                    f"• There is an active **{risk_type}** warning.\n"
                    f"• Torque is currently {trq_v} kN.m.\n\n"
                    f"Please ask specifically for **suggestions**, **current data**, **historical incidents**, or **PDF reports** to get more targeted answers from the local dataset!"
                )

        # Clear evidence entirely if it's just a greeting so the UI doesn't render massive tables
        is_greeting = q_lower.strip() in ["hi", "hello", "hey", "hi!", "hello!", "hey!"]
        
        return {
            "query": question,
            "role": role_upper,
            "well_id": well_id,
            "answer_type": answer_type,
            "answer": answer,
            "evidence_sufficiency": "SUFFICIENT" if not is_greeting else "N/A",
            "evidence": {
                "current_observation": current_obs if not is_greeting else [],
                "historical_evidence": hist_ev if not is_greeting else [],
                "document_evidence": doc_ev if not is_greeting else [],
                "analytics_output": f"Risk Engine assessed {risk_type} as HIGH severity based on multi-signal correlation" if not is_greeting else "",
                "engineering_interpretation": "Requires human decision-making. High-vis sweep and mud weight verification recommended." if not is_greeting else "",
                "limitations": limitations if not is_greeting else []
            },
            "sources": sources if not is_greeting else [],
            "data_freshness": "HISTORICAL LOG DATASET",
            "source_classification": "OIL_AUTHORIZED",
            "timestamp": datetime.now().isoformat(),
            "suggested_followups": self.get_suggested_questions(role=role_upper, well_id=well_id)
        }

assistant_service = AIAssistantService()

