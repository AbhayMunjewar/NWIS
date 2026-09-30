export type AnswerType = "FACTUAL" | "HISTORICAL" | "CURRENT_STATE" | "COMPARATIVE" | "EXPLANATORY" | "UNKNOWN";
export type EvidenceSufficiency = "SUFFICIENT" | "PARTIAL" | "INSUFFICIENT";

export interface SourceCitation {
  source_type: string;
  document: string;
  section: string;
  page?: number;
  well_id: string;
  depth_m?: number;
}

export interface DocumentEvidenceItem {
  document_name: string;
  document_type: string;
  section: string;
  page: number;
  well_id: string;
  depth_range: string;
  text_chunk: string;
}

export interface HistoricalEvidenceItem {
  incident_id: string;
  well_id: string;
  well_name: string;
  hazard_type: string;
  depth_m: number;
  formation: string;
  severity: string;
  npt_hours: number;
  cost_loss_inr: number;
  root_cause: string;
  mitigation_applied: string;
  source_document: string;
}

export interface EvidenceBreakdown {
  current_observation: string[];
  historical_evidence: HistoricalEvidenceItem[];
  document_evidence: DocumentEvidenceItem[];
  analytics_output: string;
  engineering_interpretation: string;
  limitations: string[];
}

export interface AssistantQueryResponse {
  query: string;
  role: string;
  well_id: string;
  answer_type: AnswerType;
  answer: string;
  evidence_sufficiency: EvidenceSufficiency;
  evidence: EvidenceBreakdown;
  sources: SourceCitation[];
  data_freshness: string;
  source_classification: string;
  timestamp: string;
  suggested_followups: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  responsePayload?: AssistantQueryResponse;
  error?: string;
}
