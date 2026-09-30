export interface FormationItem {
  formation_name: string;
  top_depth?: number | null;
  bottom_depth?: number | null;
  lithology: string;
}

export interface HistoricalEventItem {
  incident_id: string;
  hazard_type: string;
  severity: string;
  depth_m: number;
  npt_hours: number;
  formation: string;
}

export interface GisWell {
  well_id: string;
  well_name: string;
  field: string;
  basin: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  target_depth_m: number | null;
  status: string;
  lifecycle_status: string;
  spud_date: string;
  completion_date: string;
  formations: FormationItem[];
  formation_names: string[];
  formation_overlap: boolean;
  depth_overlap: boolean;
  historical_events: HistoricalEventItem[];
  historical_events_count: number;
  has_trajectory: boolean;
  has_logs: boolean;
  relevance_factors: string[];
  data_provenance: string;
  is_current_well?: boolean;
}

export interface CenterWell {
  well_id: string;
  well_name: string;
  latitude: number;
  longitude: number;
  field: string;
  target_depth_m: number;
  status: string;
}

export interface GisResponse {
  center_well: CenterWell | null;
  radius_km: number;
  total_found: number;
  wells: GisWell[];
  available_fields: string[];
  available_formations: string[];
  available_statuses: string[];
  available_hazard_types: string[];
  freshness: {
    status: string;
    source_classification: string;
    processing_provenance: string;
    last_updated: string;
  };
}

export interface TrajectoryPoint {
  MD: number;
  TVD: number;
  X: number;
  Y: number;
  Z: number;
  inclination: number;
  azimuth: number;
  section?: string;
}

export interface TrajectoryFormation {
  name: string;
  top: number;
  bottom: number;
  lithology: string;
}

export interface OffsetWellTrajectory {
  well_id: string;
  well_name: string;
  points: {
    MD: number;
    TVD: number;
    X: number;
    Y: number;
    Z: number;
    inclination: number;
  }[];
}

export interface TrajectoryResponse {
  available: boolean;
  well_id?: string;
  profile_type?: string;
  kop_m?: number;
  max_inc?: number;
  target_azimuth?: number;
  departure_m?: number;
  total_points_recorded?: number;
  points_sampled?: number;
  max_md?: number;
  max_tvd?: number;
  formations?: TrajectoryFormation[];
  offset_wells?: OffsetWellTrajectory[];
  points?: TrajectoryPoint[];
  message?: string;
}

export interface GisFilterState {
  centerWellId: string;
  radiusKm: number;
  field: string;
  formation: string;
  status: string;
  hazardType: string;
  minDepth: string;
  maxDepth: string;
}
