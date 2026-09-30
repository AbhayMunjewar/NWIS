export interface ParameterDetail {
  name: string;
  value: number;
  unit: string;
  previous_value: number;
  change: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  rate_of_change_per_min: number;
  quality: string;
}

export interface ParametersMap {
  depth: ParameterDetail;
  rop: ParameterDetail;
  wob: ParameterDetail;
  torque: ParameterDetail;
  rpm: ParameterDetail;
  spp: ParameterDetail;
  flow_rate: ParameterDetail;
  hookload: ParameterDetail;
}

export interface StreamHealth {
  status: string;
  connection: string;
  last_received_timestamp: string;
  data_age_seconds: number;
  update_frequency_sec: number;
  records_received: number;
  source_classification: string;
  processing_provenance: string;
}

export interface FormationLiveContext {
  current_formation: string;
  top_depth_m: number;
  bottom_depth_m: number;
  lithology: string;
  logs_available: string[];
  data_provenance: string;
}

export interface AbnormalPatternItem {
  pattern_id: string;
  pattern_name: string;
  severity: string;
  confidence_label: string;
  evidence: string[];
  drilling_implication: string;
}

export interface LiveAlertItem {
  alert_id: string;
  alert_type: string;
  severity: string;
  depth_m: number;
  timestamp: string;
  reason: string;
  evidence: string;
  status: string;
  acknowledged_by?: string | null;
}

export interface HistoricalMatchItem {
  incident_id: string;
  well_id: string;
  hazard_type: string;
  depth_m: number;
  formation: string;
  npt_hours: number;
  mitigation_applied: string;
  relevance: string;
}

export interface LiveCurrentResponse {
  well_meta: {
    well_id: string;
    well_name: string;
    field: string;
    target_depth_m: number;
    current_depth_m: number;
    depth_progress_pct: number;
    well_status: string;
    operational_status: string;
  };
  stream_health: StreamHealth;
  parameters: ParametersMap;
  formation_context: FormationLiveContext;
  abnormal_patterns: AbnormalPatternItem[];
  risk_summary: {
    status: string;
    trend: string;
    active_risk_count: number;
    critical_alert_count: number;
    evidence: string[];
  };
  active_alerts: LiveAlertItem[];
  historical_matches: HistoricalMatchItem[];
  freshness: {
    status: string;
    last_update: string;
    source_classification: string;
    processing_provenance: string;
  };
}

export interface TrendPoint {
  timestamp: string;
  depth_m: number;
  rop: number;
  wob: number;
  torque: number;
  rpm: number;
  spp: number;
  flow_rate: number;
  hookload: number;
}

export interface LiveTrendsResponse {
  well_id: string;
  window: string;
  total_points: number;
  sampled_points: number;
  trends: TrendPoint[];
}
