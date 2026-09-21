import { z } from "zod";

const prioritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
const difficultySchema = z.enum(["EASY", "NORMAL", "HARD", "EXTREME"]);
const statusSchema = z.enum(["INBOX", "PLANNED", "ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"]);

export const generatedSubtaskSchema = z.object({
  title: z.string().trim().min(1),
  estimatedMinutes: z.number().int().positive().optional(),
});

export const generatedRecurrenceSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).nullable(),
  interval: z.number().int().positive(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)),
  endDate: z.string().nullable(),
});

export const generatedMissionSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string(),
  category: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)),
  priority: prioritySchema,
  difficulty: difficultySchema,
  status: statusSchema,
  estimatedMinutes: z.number().int().positive(),
  deadline: z.string().nullable(),
  startDate: z.string().nullable(),
  notes: z.string(),
  links: z.array(z.string().url()),
  blockedReason: z.string(),
  recurrence: generatedRecurrenceSchema,
  subtasks: z.array(generatedSubtaskSchema).min(1).max(8),
});

export type GeneratedMission = z.infer<typeof generatedMissionSchema>;
export type GeneratedSubtask = z.infer<typeof generatedSubtaskSchema>;
