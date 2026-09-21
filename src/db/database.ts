import Dexie, { type Table } from "dexie";

export type MissionPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type MissionStatus =
  | "INBOX"
  | "PLANNED"
  | "ACTIVE"
  | "BLOCKED"
  | "COMPLETED"
  | "ARCHIVED";

export type MissionDifficulty =
  | "EASY"
  | "NORMAL"
  | "HARD"
  | "EXTREME";

export type RecurrenceFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Recurrence {
  enabled: boolean;
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
}

export interface Mission {
  id?: number;
  missionCode?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  priority: MissionPriority;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  duration: string;
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  deadline?: Date;
  startDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  blockedReason?: string;
  notes: string;
  links: string[];
  subtasks: Subtask[];
  recurrence?: Recurrence;
  progress: number;
}

export function missionDefaults(
  mission: Partial<Mission> & Pick<Mission, "title">,
): Mission {
  const now = new Date();
  const completed = mission.completed ?? false;
  const estimatedMinutes = mission.estimatedMinutes ?? 30;

  return {
    id: mission.id,
    missionCode:
      mission.missionCode ??
      (mission.id === undefined
        ? undefined
        : `OP-${String(mission.id).padStart(4, "0")}`),
    title: mission.title,
    description: mission.description ?? "",
    category: mission.category ?? "PERSONAL",
    tags: mission.tags ?? [],
    priority: mission.priority ?? "MEDIUM",
    difficulty: mission.difficulty ?? "NORMAL",
    status:
      mission.status ?? (completed ? "COMPLETED" : "ACTIVE"),
    duration: mission.duration ?? formatDuration(estimatedMinutes),
    estimatedMinutes,
    actualMinutes: mission.actualMinutes ?? 0,
    completed,
    deadline: mission.deadline,
    startDate: mission.startDate,
    createdAt: mission.createdAt ?? now,
    updatedAt: mission.updatedAt ?? now,
    completedAt: mission.completedAt,
    blockedReason: mission.blockedReason,
    notes: mission.notes ?? "",
    links: mission.links ?? [],
    subtasks: mission.subtasks ?? [],
    recurrence: mission.recurrence,
    progress: mission.progress ?? 0,
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}M`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}H` : `${hours}H ${remaining}M`;
}

class BatcomDatabase extends Dexie {
  missions!: Table<Mission, number>;

  constructor() {
    super("BATCOM_DATABASE");

    this.version(1).stores({
      missions:
        "++id, title, category, priority, completed, status, createdAt, deadline",
    });

    this.version(2)
      .stores({
        missions:
          "++id, missionCode, title, category, priority, difficulty, status, completed, createdAt, updatedAt, deadline, startDate",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("missions")
          .toCollection()
          .modify((record: Partial<Mission> & { title: string }) => {
            Object.assign(record, missionDefaults(record));
          });
      });
  }
}

export const db = new BatcomDatabase();