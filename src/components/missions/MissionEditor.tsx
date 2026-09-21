import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus, Trash2, X } from "lucide-react";
import { db, type Mission, type Subtask } from "../../db/database";

const schema = z.object({
  title: z.string().trim().min(1, "Mission title is required"),
  description: z.string(), category: z.string().trim().min(1, "Operation type is required"), tags: z.string(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]), difficulty: z.enum(["EASY", "NORMAL", "HARD", "EXTREME"]),
  status: z.enum(["INBOX", "PLANNED", "ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"]), startDate: z.string(), deadline: z.string(),
  estimatedMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"), notes: z.string(),
  links: z.string().refine((value) => value.split(",").map((item) => item.trim()).filter(Boolean).every((item) => /^https?:\/\//i.test(item)), "Links must start with http:// or https://"),
  blockedReason: z.string(), recurrenceEnabled: z.boolean(), recurrenceFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).nullable(), recurrenceInterval: z.coerce.number().int().min(1), recurrenceDays: z.string(), recurrenceEndDate: z.string(),
  subtasks: z.array(z.object({ id: z.string(), title: z.string().trim().min(1), completed: z.boolean(), createdAt: z.date(), completedAt: z.date().optional() })), progress: z.coerce.number().int().min(0).max(100),
});
type Values = z.infer<typeof schema>;

type Props = { mission: Mission; persist?: boolean; onClose: () => void; onSaved: (mission: Mission) => void };

export default function MissionEditor({ mission, persist = true, onClose, onSaved }: Props) {
  const form = useForm<Values>({ resolver: zodResolver(schema) as never, defaultValues: fromMission(mission) });
  const subtasks = useFieldArray({ control: form.control, name: "subtasks", keyName: "formId" });

  const submit = async (values: Values) => {
    const updated = toMission(values, mission);
    if (persist && updated.id !== undefined) {
      const { id: _id, ...changes } = updated;
      await db.missions.update(updated.id, changes);
    }
    onSaved(updated);
  };

  return (
    <div className="fixed inset-0 z-[160] overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <form onSubmit={form.handleSubmit(submit)} className="mx-auto max-w-4xl border border-yellow-400/20 bg-[#0c0c0c] p-6 md:p-8">
        <header className="flex items-start justify-between border-b border-white/10 pb-5">
          <div><p className="font-mono text-[9px] tracking-[0.3em] text-yellow-400">BATCOM // MISSION EDITOR</p><h2 className="mt-2 text-2xl font-black">{persist ? "Edit Mission" : "Edit Generated Mission"}</h2><p className="mt-2 text-xs text-gray-600">{persist ? "Changes save directly to the local mission system." : "Draft changes stay in memory until deployment."}</p></div>
          <button type="button" onClick={onClose} aria-label="Close mission editor" className="p-2 text-gray-600 hover:text-white"><X size={18} /></button>
        </header>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="TITLE" error={form.formState.errors.title?.message} wide><input {...form.register("title")} autoFocus /></Field>
          <Field label="DESCRIPTION" wide><textarea {...form.register("description")} rows={4} /></Field>
          <Field label="CATEGORY" error={form.formState.errors.category?.message}><input {...form.register("category")} /></Field>
          <Field label="TAGS"><input {...form.register("tags")} placeholder="React, AI, Priority" /></Field>
          <SelectField label="THREAT LEVEL" {...form.register("priority")} options={["CRITICAL", "HIGH", "MEDIUM", "LOW"]} />
          <SelectField label="DIFFICULTY" {...form.register("difficulty")} options={["EASY", "NORMAL", "HARD", "EXTREME"]} />
          <SelectField label="STATUS" {...form.register("status")} options={["INBOX", "PLANNED", "ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"]} />
          <Field label="ESTIMATED MINUTES" error={form.formState.errors.estimatedMinutes?.message}><input type="number" min="1" {...form.register("estimatedMinutes")} /></Field>
          <Field label="START DATE"><input type="datetime-local" {...form.register("startDate")} /></Field>
          <Field label="DEADLINE"><input type="datetime-local" {...form.register("deadline")} /></Field>
          <Field label="BLOCK REASON"><input {...form.register("blockedReason")} /></Field>
          <Field label="LINKS" error={form.formState.errors.links?.message}><input {...form.register("links")} placeholder="https://example.com" /></Field>
          <Field label="NOTES" wide><textarea {...form.register("notes")} rows={3} /></Field>
        </div>
        <section className="mt-7 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between"><p className="font-mono text-[9px] tracking-widest text-gray-600">SUBTASKS // {subtasks.fields.length}</p><button type="button" onClick={() => subtasks.append({ id: crypto.randomUUID(), title: "New subtask", completed: false, createdAt: new Date() })} className="flex items-center gap-2 border border-yellow-400/20 px-3 py-2 text-[9px] tracking-widest text-yellow-400"><Plus size={13} /> ADD SUBTASK</button></div>
          <div className="mt-3 space-y-2">{subtasks.fields.map((field, index) => <div key={field.formId} className="flex items-center gap-2"><button type="button" onClick={() => form.setValue(`subtasks.${index}.completed`, !field.completed)} className={`flex h-6 w-6 items-center justify-center border ${field.completed ? "border-yellow-400 bg-yellow-400 text-black" : "border-white/10 text-transparent"}`}><Check size={13} /></button><input {...form.register(`subtasks.${index}.title`)} className="min-w-0 flex-1 border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/40" /><button type="button" onClick={() => subtasks.remove(index)} aria-label={`Remove subtask ${index + 1}`} className="p-2 text-gray-600 hover:text-red-400"><Trash2 size={14} /></button></div>)}</div>
        </section>
        <section className="mt-7 grid gap-5 border-t border-white/10 pt-5 md:grid-cols-2">
          <label className="flex items-center gap-3 text-xs text-gray-400"><input type="checkbox" {...form.register("recurrenceEnabled")} /> RECURRING MISSION</label>
          <SelectField label="RECURRENCE" {...form.register("recurrenceFrequency")} options={["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]} />
          <Field label="INTERVAL"><input type="number" min="1" {...form.register("recurrenceInterval")} /></Field><Field label="DAYS OF WEEK"><input {...form.register("recurrenceDays")} placeholder="1, 3, 5" /></Field>
          <Field label="RECURRENCE END DATE"><input type="date" {...form.register("recurrenceEndDate")} /></Field><Field label="MANUAL PROGRESS"><input type="number" min="0" max="100" {...form.register("progress")} /></Field>
        </section>
        <footer className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="border border-white/10 px-5 py-3 text-xs tracking-widest text-gray-500">CANCEL</button><button type="submit" className="bg-yellow-400 px-5 py-3 text-xs font-black tracking-widest text-black">{persist ? "SAVE MISSION" : "APPLY TO DRAFT"}</button></footer>
      </form>
    </div>
  );
}

function fromMission(mission: Mission): Values {
  return { title: mission.title, description: mission.description, category: mission.category, tags: mission.tags.join(", "), priority: mission.priority, difficulty: mission.difficulty, status: mission.status, startDate: inputDate(mission.startDate), deadline: inputDate(mission.deadline), estimatedMinutes: mission.estimatedMinutes, notes: mission.notes, links: mission.links.join(", "), blockedReason: mission.blockedReason ?? "", recurrenceEnabled: mission.recurrence?.enabled ?? false, recurrenceFrequency: mission.recurrence?.frequency ?? null, recurrenceInterval: mission.recurrence?.interval ?? 1, recurrenceDays: mission.recurrence?.daysOfWeek?.join(", ") ?? "", recurrenceEndDate: inputDate(mission.recurrence?.endDate), subtasks: mission.subtasks, progress: mission.progress };
}

function toMission(values: Values, original: Mission): Mission {
  const frequency = values.recurrenceFrequency;
  const recurrence = values.recurrenceEnabled && frequency ? { enabled: true, frequency, interval: values.recurrenceInterval, daysOfWeek: values.recurrenceDays.split(",").map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6), endDate: dateValue(values.recurrenceEndDate) } : undefined;
  const progress = values.subtasks.length ? Math.round((values.subtasks.filter((item) => item.completed).length / values.subtasks.length) * 100) : values.progress;
  return { ...original, title: values.title.trim(), description: values.description, category: values.category.trim().toUpperCase(), tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean), priority: values.priority, difficulty: values.difficulty, status: values.status, completed: values.status === "COMPLETED", estimatedMinutes: values.estimatedMinutes, duration: formatDuration(values.estimatedMinutes), startDate: dateValue(values.startDate), deadline: dateValue(values.deadline), notes: values.notes, links: values.links.split(",").map((link) => link.trim()).filter(Boolean), blockedReason: values.blockedReason || undefined, recurrence, subtasks: values.subtasks as Subtask[], progress, updatedAt: new Date() };
}

function Field({ label, error, wide = false, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <label className={wide ? "block md:col-span-2" : "block"}><span className="font-mono text-[9px] tracking-widest text-gray-600">{label}</span><div className="mt-2 [&>input]:w-full [&>input]:border [&>input]:border-white/10 [&>input]:bg-black [&>input]:px-3 [&>input]:py-3 [&>input]:text-sm [&>input]:text-white [&>input]:outline-none [&>textarea]:w-full [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black [&>textarea]:p-3 [&>textarea]:text-sm [&>textarea]:text-white [&>textarea]:outline-none">{children}</div>{error && <span className="mt-1 block text-[10px] text-red-400">{error}</span>}</label>; }
function SelectField({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) { return <label className="block"><span className="font-mono text-[9px] tracking-widest text-gray-600">{label}</span><select {...props} className="mt-2 w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none"><option value="">NONE</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function inputDate(date?: Date): string { return date ? new Date(date).toISOString().slice(0, 16) : ""; }
function dateValue(value: string): Date | undefined { return value ? new Date(value) : undefined; }
function formatDuration(minutes: number): string { if (minutes < 60) return `${minutes}M`; const hours = Math.floor(minutes / 60); const remainder = minutes % 60; return remainder ? `${hours}H ${remainder}M` : `${hours}H`; }
