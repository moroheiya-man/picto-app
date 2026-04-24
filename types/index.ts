export type AnalysisCategory =
  | "food"
  | "landmark"
  | "sign"
  | "landscape"
  | "art"
  | "other";

export interface AnalysisDetail {
  label: string;
  value: string;
}

export interface AnalysisResult {
  category: AnalysisCategory;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  details: AnalysisDetail[];
  tips: string[];
}
