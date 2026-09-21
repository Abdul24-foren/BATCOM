import type { GeneratedMission } from "../../schemas/aiMissionSchema";

export type AIProvider = "mock" | "api";

export interface MissionGenerationResult {
  mission: GeneratedMission;
  source: "LOCAL BATCOM INTELLIGENCE" | "SECURE AI PROVIDER";
}

export interface AIMissionProvider {
  generateMission(prompt: string): Promise<MissionGenerationResult>;
}
