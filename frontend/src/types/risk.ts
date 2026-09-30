export type RiskSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "SUPPRESSED";

export interface RiskSummary {
  overall_risk_status: RiskSeverity;
  active_risk_count: number;
  critical_risk_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  risk_trend: "STABLE" | "INCREASING" | "DECREASING";
  current_well_id: string;
  current_well_name: string;
  current_depth_m: number;
  current_formation: string;
  last_risk_update: string;
  data_freshness: string;
  source_classification: string;
  analytics_status: string;
}

export interface AlertItem {
  alert_id: string;
  incident_id?: string;
  alert_type: string;
  hazard_type: string;
  severity: RiskSeverity;
  well_id: string;
  well_name: string;
  current_depth_m: number;
  formation: string;
  timestamp: string;
  status: AlertStatus;
  short_reason: string;
  evidence_availability: "VALID" | "LIMITED" | "INSUFFICIENT";
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
}

export interface ObservedParameter {
  name: string;
  value: string;
  baseline: string;
  status: string;
}

export interface HistoricalMatch {
  incident_id: string;
  well_id: string;
  well_name: string;
  hazard_type: string;
  depth_m: number;
  formation: string;
  severity: string;
  npt_hours: number;
  root_cause: string;
  mitigation_applied: string;
  source_document?: string;
  relevance_notes?: string;
}

export interface EvidenceLayers {
  observed_data: string[];
  derived_features: string[];
  anomaly_output: string;
  historical_evidence: HistoricalMatch[];
  risk_engine_output: string;
  engineering_interpretation: string;
  unavailable_information: string[];
}

export interface AlertDetail {
  alert: AlertItem;
  trigger_condition: string;
  observed_parameters: ObservedParameter[];
  evidence_layers: EvidenceLayers;
  historical_context: HistoricalMatch[];
  data_quality: string;
  data_freshness: string;
  source_classification: string;
  source_traceability?: {
    source_type: string;
    document: string;
    section: string;
    depth_range: string;
  };
  audit_history?: AuditEntry[];
}

export interface TimelineEvent {
  timestamp: string;
  depth_m: number;
  event: string;
  severity: RiskSeverity;
  status: string;
  actor: string;
  description: string;
}

export interface TrendPoint {
  depth_m: number;
  time: string;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export interface RiskTrends {
  well_id: string;
  trend_type: string;
  points: TrendPoint[];
}

export interface AuditEntry {
  audit_id: string;
  alert_id: string;
  action: string;
  user_id: string;
  user_name: string;
  role: string;
  timestamp: string;
  details: string;
}
