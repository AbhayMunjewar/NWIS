export interface HistoricalSummary {
  total_historical_wells: number;
  total_historical_events: number;
  fields_count: number;
  fields_list: string[];
  data_freshness: string;
  source_classification: string;
  last_updated: string;
}

export interface HistoricalWell {
  well_id: string;
  well_name: string;
  field: string;
  basin: string;
  latitude: number;
  longitude: number;
  target_depth_m: number;
  status: string;
  spud_date: string;
  completion_date: string;
  formation_count: number;
  event_count: number;
  data_availability: string;
  data_provenance: string;
}

export interface FormationInterval {
  formation_name: string;
  top_depth_m: number;
  bottom_depth_m: number;
  lithology: string;
  description: string;
}

export interface HistoricalEvent {
  incident_id: string;
  well_id: string;
  well_name: string;
  field: string;
  formation: string;
  hazard_type: string;
  severity: string;
  depth_m: number;
  start_depth: number;
  end_depth: number;
  npt_hours: number;
  cost_loss_inr: number;
  root_cause: string;
  mitigation_applied: string;
  source_document: string;
  start_time: string;
  end_time: string;
}

export interface CasingRecord {
  casing_size: string;
  setting_depth: number;
  grade: string;
  weight: string;
  shoe_depth: number;
  source_document: string;
}

export interface MudRecord {
  depth_m: number;
  mud_weight_gcc: number;
  viscosity_sec: number;
  fluid_type: string;
  remarks: string;
}

export interface HistoricalDocument {
  doc_id: string;
  document_name: string;
  document_type: string;
  file_format: string;
  file_size_bytes?: number;
  associated_well: string;
  associated_event_id?: string;
  source_classification: string;
  ocr_status: string;
  report_type_label: string;
  relative_path?: string;
  download_url: string;
  summary?: string;
}

export interface WellDetail {
  well: HistoricalWell;
  formations: FormationInterval[];
  events: HistoricalEvent[];
  casing: CasingRecord[];
  mud_program: MudRecord[];
  documents?: HistoricalDocument[];
  document_status_note?: string;
  source_traceability?: {
    source_type: string;
    document: string;
    section: string;
  };
}

export interface WellLogCurvePoint {
  depth_m: number;
  GR: number;
  RES: number;
  RHOB: number;
  NPHI: number;
  DTC: number;
}

export interface WellLogs {
  well_id: string;
  log_interval: { top_m: number; bottom_m: number };
  available_curves: string[];
  depth_reference: string;
  data_status: string;
  points: WellLogCurvePoint[];
}

export interface TrajectoryPoint {
  md_m: number;
  tvd_m: number;
  inclination_deg: number;
  azimuth_deg: number;
  easting_m: number;
  northing_m: number;
}

export interface WellTrajectory {
  well_id: string;
  trajectory_type: string;
  total_survey_points: number;
  data_status: string;
  points: TrajectoryPoint[];
}

export interface HistoricalComparison {
  current_well: HistoricalWell;
  historical_well: HistoricalWell;
  current_formations: FormationInterval[];
  historical_formations: FormationInterval[];
  historical_events: HistoricalEvent[];
  relevance_factors: string[];
  comparison_notes: string;
}
