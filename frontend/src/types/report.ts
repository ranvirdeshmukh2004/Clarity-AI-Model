import type { Meeting } from "./meeting";
import type { AnalysisResult, Flag, ActionItem } from "./analysis";

export interface ReportData {
  meeting: Meeting;
  analysis: AnalysisResult;
  flags: Flag[];
  action_items: ActionItem[];
}
