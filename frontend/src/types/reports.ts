export interface ReportTypeInfo {
  id: string;
  title: string;
  category: string;
  description: string;
  permitted_roles: string[];
  supports_pdf: boolean;
  supports_csv: boolean;
  icon: string;
}

export interface ReportAvailabilityResult {
  well_id: string;
  report_type: string;
  date_range: string;
  well_found: boolean;
  telemetry_available: boolean;
  risk_data_available: boolean;
  historical_events_available: boolean;
  is_sufficient: boolean;
  warnings: string[];
}

export interface ReportMetadata {
  report_id: string;
  report_type: string;
  title: string;
  well_id: string;
  well_name: string;
  field: string;
  reporting_period: string;
  depth_range: string;
  selected_formation?: string;
  generated_by: string;
  user_role: string;
  generated_at: string;
  source_classification: string;
  data_freshness: string;
  status: string;
  provenance_hash?: string;
}

export interface TelemetryMetricRow {
  parameter: string;
  value: string;
  unit: string;
  min: number;
  max: number;
  avg: number;
}

export interface RiskBreakdownRow {
  risk_type: string;
  severity: string;
  score: number;
  trigger_factors: string[];
  mitigation: string;
}

export interface GeologicalTopRow {
  formation: string;
  top_m: number;
  bottom_m: number;
  lithology: string;
  logs: string;
}

export interface GeologicalSummaryDetails {
  well_name: string;
  well_id: string;
  field_basin: string;
  current_depth_m: number;
  total_depth_m: number;
  formation_name: string;
  formation_top_depth_m: number;
  formation_bottom_depth_m: number;
  formation_intervals: string;
  lithology: string;
  formation_tops: GeologicalTopRow[];
  available_well_logs: Record<string, string>;
  well_log_observations: string;
  geological_correlation: string;
  relevant_geological_events: string;
  geological_interpretation: string;
  supporting_data_sources: string;
  source_provenance: string;
  report_date: string;
  selected_depth_interval: string;
}

export interface HistoricalIncidentDetails {
  historical_well_name: string;
  historical_well_id: string;
  event_id: string;
  event_type: string;
  event_datetime: string;
  event_depth_m: number;
  formation_at_event_depth: string;
  lithology: string;
  event_severity: string;
  event_duration_npt: string;
  historical_event_description: string;
  geological_context: string;
  similar_events_in_offset_wells: string;
  relevant_historical_evidence: string;
  original_report_references: string;
  geological_interpretation: string;
  source_provenance: string;
}

export interface GeologicalResearchDetails {
  research_title: string;
  selected_wells: string[];
  selected_formation_depth_interval: string;
  formation_information: string;
  lithology: string;
  well_log_observations: string;
  formation_correlation: string;
  nearby_offset_well_comparison: string;
  historical_geological_evidence: string;
  relevant_technical_documents: string[];
  geological_findings: string;
  interpretation: string;
  data_limitations: string;
  sources_references: string;
}

export interface FormationCorrelationDetails {
  selected_wells: string[];
  formation_names: string[];
  formation_tops: any[];
  formation_depths: string;
  lithology_comparison: string;
  well_log_comparison: string;
  formation_interval_comparison: string;
  geological_similarities_differences: string;
  offset_well_correlation: string;
  supporting_evidence: string;
  geological_interpretation: string;
  source_references: string;
}

export interface ReportPreviewPayload {
  metadata: ReportMetadata;
  executive_summary: string;
  geological_summary?: GeologicalSummaryDetails;
  historical_incident_summary?: HistoricalIncidentDetails;
  geological_research?: GeologicalResearchDetails;
  formation_correlation?: FormationCorrelationDetails;
  telemetry_metrics?: TelemetryMetricRow[];
  risk_breakdown?: RiskBreakdownRow[];
  historical_events?: any[];
  geological_tops?: GeologicalTopRow[];
  npt_logs?: any[];
  data_quality_audit?: {
    witsml_packets_received: number;
    missing_packets: number;
    sensor_completeness_pct: number;
    data_freshness_status: string;
  };
  limitations?: string[];
}

export interface ReportHistoryItem {
  report_id: string;
  report_type: string;
  title: string;
  well_id: string;
  well_name: string;
  reporting_period: string;
  generated_by: string;
  user_role: string;
  generated_at: string;
  status: string;
  file_type: string;
  file_size: string;
  source_classification: string;
  data_freshness: string;
}
