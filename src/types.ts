export interface Sensor {
  name: string;
  location: string;
  function: string;
  likely_faulty: boolean;
}

export interface DiagnosisResult {
  code: string;
  description: string;
  system_affected: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  common_symptoms: string[];
  sensors_involved: Sensor[];
  possible_causes: string[];
  diagnostic_steps: string[];
  resolution_steps: string[];
  estimated_repair_cost: string;
  diy_difficulty: 'easy' | 'moderate' | 'difficult' | 'professional_only';
  additional_notes: string;
}

export interface FormData {
  year: string;
  make: string;
  model: string;
  code: string;
}
