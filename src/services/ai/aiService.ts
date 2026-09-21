import { addDays, addMonths, addWeeks, nextFriday, startOfDay } from "date-fns";
import { generatedMissionSchema, type GeneratedMission } from "../../schemas/aiMissionSchema";
import type { AIMissionProvider, MissionGenerationResult } from "./types";

const apiEndpoint = import.meta.env.VITE_BATCOM_AI_ENDPOINT as string | undefined;

const mockProvider: AIMissionProvider = {
  async generateMission(prompt) {
    return {
      mission: analyzeLocally(prompt),
      source: "LOCAL BATCOM INTELLIGENCE",
    };
  },
};

const apiProvider: AIMissionProvider = {
  async generateMission(prompt) {
    if (!apiEndpoint) throw new Error("A secure BATCOM AI endpoint is not configured.");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    if (!response.ok) throw new Error(`AI provider returned ${response.status}.`);
    const payload: unknown = await response.json();
    const parsed = generatedMissionSchema.safeParse(payload);
    if (!parsed.success) throw new Error("AI provider returned an invalid mission structure.");
    return { mission: parsed.data, source: "SECURE AI PROVIDER" };
  },
};

export async function generateMissionFromPrompt(prompt: string): Promise<MissionGenerationResult> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) throw new Error("Describe an objective before analysis.");
  const provider = apiEndpoint ? apiProvider : mockProvider;
  const result = await provider.generateMission(cleanPrompt);
  const validated = generatedMissionSchema.safeParse(result.mission);
  if (!validated.success) throw new Error("BATCOM generated an invalid mission structure.");
  return { ...result, mission: validated.data };
}

function analyzeLocally(prompt: string): GeneratedMission {
  const normalized = prompt.toLowerCase();
  const deadline = inferDeadline(normalized);
  const isHard = /hard|complex|extreme|interview|deploy|authentication|docker|kubernetes|aws/.test(normalized);
  const isRecurring = /every (day|daily|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|each week|weekly|monthly/.test(normalized);
  const category = inferCategory(normalized);
  const title = inferTitle(prompt);
  const subtasks = inferSubtasks(normalized);
  const estimatedMinutes = Math.max(60, subtasks.reduce((total, subtask) => total + (subtask.estimatedMinutes ?? 30), 0));
  const recurrence = inferRecurrence(normalized);

  return {
    title,
    description: `Convert this objective into an executable operation: ${prompt.trim()}`,
    category,
    tags: uniqueTags([category, ...keywordTags(normalized)]),
    priority: /urgent|asap|critical|deadline|interview|deploy/.test(normalized) ? "HIGH" : "MEDIUM",
    difficulty: isHard ? "HARD" : "NORMAL",
    status: "PLANNED",
    estimatedMinutes,
    deadline,
    startDate: null,
    notes: "Generated locally from the supplied objective. Review before deployment.",
    links: extractLinks(prompt),
    blockedReason: "",
    recurrence: isRecurring ? recurrence : { enabled: false, frequency: null, interval: 1, daysOfWeek: [], endDate: null },
    subtasks,
  };
}

function inferTitle(prompt: string): string {
  const cleaned = prompt.replace(/^\s*(create|plan|build|make|generate)\s+(a\s+)?mission\s+(to|for)\s*/i, "").replace(/[.!?]+$/, "").trim();
  if (!cleaned) return "Untitled Mission";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function inferCategory(prompt: string): string {
  if (/interview|resume|career/.test(prompt)) return "INTERVIEW";
  if (/docker|kubernetes|aws|deploy|node|react|authentication|api|code|project/.test(prompt)) return "PROJECT";
  if (/college|assignment|exam|study|learn|course|python|sql|ml/.test(prompt)) return "LEARNING";
  if (/gym|exercise|health|sleep/.test(prompt)) return "HEALTH";
  return "GENERAL";
}

function inferSubtasks(prompt: string) {
  const specific: string[] = [];
  if (/python/.test(prompt)) specific.push("Revise Python fundamentals");
  if (/ml|machine learning|ai/.test(prompt)) specific.push("Review ML fundamentals");
  if (/sql|database/.test(prompt)) specific.push("Practice SQL and data queries");
  if (/aptitude/.test(prompt)) specific.push("Practice aptitude questions");
  if (/interview/.test(prompt)) specific.push("Complete a mock interview");
  if (/docker/.test(prompt)) specific.push("Containerize the application");
  if (/kubernetes/.test(prompt)) specific.push("Create a Kubernetes deployment plan");
  if (/aws|cloud/.test(prompt)) specific.push("Map the deployment to AWS services");
  if (/authentication|auth/.test(prompt)) specific.push("Design the authentication flow");
  if (/deploy/.test(prompt)) specific.push("Deploy and verify the release");
  const defaults = specific.length > 0 ? specific : ["Define the success criteria", "Break the objective into work items", "Execute the core operation", "Review and verify the result"];
  return defaults.slice(0, 8).map((subtask, index) => ({ title: subtask, estimatedMinutes: index === 0 ? 30 : 45 }));
}

function inferDeadline(prompt: string): string | null {
  const now = startOfDay(new Date());
  if (/tomorrow/.test(prompt)) return isoDate(addDays(now, 1));
  if (/in 3 days|three days/.test(prompt)) return isoDate(addDays(now, 3));
  if (/this weekend/.test(prompt)) return isoDate(addDays(now, (6 - now.getDay() + 7) % 7 || 7));
  if (/next month/.test(prompt)) return isoDate(addMonths(now, 1));
  if (/next friday/.test(prompt)) return isoDate(nextFriday(now));
  if (/next sunday/.test(prompt)) return isoDate(addWeeks(now, 1));
  const explicit = prompt.match(/(?:before|by|on)\s+(\d{4}-\d{2}-\d{2})/);
  return explicit?.[1] ?? null;
}

function inferRecurrence(prompt: string) {
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    .map((day, index) => prompt.includes(day) ? index : -1).filter((index) => index >= 0);
  const frequency = /monthly/.test(prompt) ? "MONTHLY" : /weekly|monday|tuesday|wednesday|thursday|friday|saturday|sunday/.test(prompt) ? "WEEKLY" : "DAILY";
  return { enabled: true, frequency: frequency as "DAILY" | "WEEKLY" | "MONTHLY", interval: 1, daysOfWeek, endDate: null };
}

function keywordTags(prompt: string): string[] {
  return ["ai", "interview", "python", "ml", "sql", "docker", "kubernetes", "aws", "react", "node", "authentication", "project", "study"]
    .filter((keyword) => prompt.includes(keyword));
}

function extractLinks(prompt: string): string[] {
  return prompt.match(/https?:\/\/[^\s]+/g) ?? [];
}

function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.toUpperCase())));
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
