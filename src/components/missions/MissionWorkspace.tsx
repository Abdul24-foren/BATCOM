import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Archive,
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  Filter,
  ListFilter,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import {
  db,
  missionDefaults,
  type Mission,
  type MissionDifficulty,
  type MissionPriority,
  type MissionStatus,
  type Subtask,
} from "../../db/database";

const priorities: MissionPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const difficulties: MissionDifficulty[] = ["EASY", "NORMAL", "HARD", "EXTREME"];
const statuses: MissionStatus[] = ["INBOX", "PLANNED", "ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"];

const missionFormSchema = z.object({
  title: z.string().trim().min(1, "Mission title is required"),
  description: z.string(),
  category: z.string().trim().min(1, "Operation type is required"),
  tags: z.string(),
  priority: z.enum(priorities),
  difficulty: z.enum(difficulties),
  status: z.enum(statuses),
  startDate: z.string(),
  deadline: z.string(),
  estimatedMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  notes: z.string(),
  links: z.string().refine(
    (value) => value.split(",").map((item) => item.trim()).filter(Boolean).every((item) => /^https?:\/\//i.test(item)),
    "Links must start with http:// or https://",
  ),
  blockedReason: z.string(),
  recurrenceEnabled: z.boolean(),
  recurrenceFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).nullable(),
  recurrenceInterval: z.coerce.number().int().min(1),
  recurrenceDays: z.string(),
  recurrenceEndDate: z.string(),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string().trim().min(1),
    completed: z.boolean(),
    createdAt: z.date(),
    completedAt: z.date().optional(),
  })),
  progress: z.coerce.number().int().min(0).max(100),
});

type MissionFormValues = z.infer<typeof missionFormSchema>;
type SortKey = "updatedAt" | "deadline" | "priority" | "difficulty" | "progress" | "title";

const emptyForm: MissionFormValues = {
  title: "",
  description: "",
  category: "PERSONAL",
  tags: "",
  priority: "MEDIUM",
  difficulty: "NORMAL",
  status: "ACTIVE",
  startDate: "",
  deadline: "",
  estimatedMinutes: 30,
  notes: "",
  links: "",
  blockedReason: "",
  recurrenceEnabled: false,
  recurrenceFrequency: null,
  recurrenceInterval: 1,
  recurrenceDays: "",
  recurrenceEndDate: "",
  subtasks: [],
  progress: 0,
};

export default function MissionWorkspace({
  onBack,
  onFocus,
}: {
  onBack: () => void;
  onFocus: () => void;
}) {
  const missions = useLiveQuery(
    () => db.missions.toArray().then((records) => records.map((mission) => missionDefaults(mission))),
    [],
    [],
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | MissionStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | MissionPriority>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | MissionDifficulty>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDescending, setSortDescending] = useState(true);
  const [selectedId, setSelectedId] = useState<number>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission>();
  const [deleteTarget, setDeleteTarget] = useState<Mission>();

  const categories = useMemo(
    () => Array.from(new Set(missions.map((mission) => mission.category))).sort(),
    [missions],
  );

  const filteredMissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return missions
      .filter((mission) => statusFilter === "ALL" ? mission.status !== "ARCHIVED" : mission.status === statusFilter)
      .filter((mission) => priorityFilter === "ALL" || mission.priority === priorityFilter)
      .filter((mission) => difficultyFilter === "ALL" || mission.difficulty === difficultyFilter)
      .filter((mission) => categoryFilter === "ALL" || mission.category === categoryFilter)
      .filter((mission) => {
        if (!normalizedQuery) return true;
        return [mission.title, mission.description, mission.category, mission.notes, mission.blockedReason, ...mission.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((left, right) => compareMissions(left, right, sortKey) * (sortDescending ? -1 : 1));
  }, [categoryFilter, difficultyFilter, missions, priorityFilter, query, sortDescending, sortKey, statusFilter]);

  const selectedMission = missions.find((mission) => mission.id === selectedId);

  const openCreate = () => {
    setEditingMission(undefined);
    setEditorOpen(true);
  };

  const openEdit = (mission: Mission) => {
    setEditingMission(mission);
    setEditorOpen(true);
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setDifficultyFilter("ALL");
    setCategoryFilter("ALL");
  };

  return (
    <div className="min-h-screen bg-[#070707] px-4 pb-24 pt-20 text-white md:px-7 lg:ml-72 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1700px]">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button onClick={onBack} className="mb-5 flex items-center gap-2 font-mono text-[10px] tracking-widest text-gray-600 hover:text-yellow-400">
              <ArrowLeft size={14} /> COMMAND CENTER
            </button>
            <p className="font-mono text-[9px] tracking-[0.35em] text-yellow-400">BATCOM // MISSION INTELLIGENCE</p>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">Active Missions</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Search, classify, and deploy every operation from one persistent mission queue.</p>
          </div>
          <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-yellow-400 px-5 py-3 text-xs font-black tracking-widest text-black hover:bg-yellow-300">
            <Plus size={17} /> NEW MISSION
          </button>
        </header>

        <div className="mt-6 flex flex-col gap-3 border-b border-white/10 pb-5 xl:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-3 border border-white/10 bg-[#0b0b0b] px-4 py-3">
            <Search size={17} className="text-yellow-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, notes, tags, description..." className="w-full bg-transparent text-sm outline-none placeholder:text-gray-700" />
          </label>
          <FilterSelect label="STATUS" value={statusFilter} options={["ALL", ...statuses]} onChange={(value) => setStatusFilter(value as "ALL" | MissionStatus)} />
          <FilterSelect label="THREAT" value={priorityFilter} options={["ALL", ...priorities]} onChange={(value) => setPriorityFilter(value as "ALL" | MissionPriority)} />
          <FilterSelect label="SORT" value={sortKey} options={["updatedAt", "deadline", "priority", "difficulty", "progress", "title"]} onChange={(value) => setSortKey(value as SortKey)} />
          <button onClick={() => setSortDescending((descending) => !descending)} className="flex items-center justify-center gap-2 border border-white/10 px-4 py-3 font-mono text-[9px] tracking-widest text-gray-500 hover:text-yellow-400">
            <ChevronDown size={14} className={sortDescending ? "" : "rotate-180"} /> {sortDescending ? "DESC" : "ASC"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-gray-600" />
          <FilterSelect label="DIFFICULTY" value={difficultyFilter} options={["ALL", ...difficulties]} onChange={(value) => setDifficultyFilter(value as "ALL" | MissionDifficulty)} compact />
          <FilterSelect label="CATEGORY" value={categoryFilter} options={["ALL", ...categories]} onChange={setCategoryFilter} compact />
          {(query || statusFilter !== "ALL" || priorityFilter !== "ALL" || difficultyFilter !== "ALL" || categoryFilter !== "ALL") && (
            <button onClick={clearFilters} className="ml-auto font-mono text-[9px] tracking-widest text-yellow-400 hover:text-white">CLEAR FILTERS</button>
          )}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between font-mono text-[9px] tracking-[0.25em] text-gray-600">
              <span>{filteredMissions.length} OPERATIONS DETECTED</span>
              <span>LOCAL // INDEXEDDB</span>
            </div>
            {filteredMissions.length === 0 ? (
              <EmptyMissions hasFilters={Boolean(query || statusFilter !== "ALL" || priorityFilter !== "ALL")} onCreate={openCreate} />
            ) : (
              <div className="space-y-2">
                {filteredMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} selected={mission.id === selectedId} onClick={() => setSelectedId(mission.id)} />
                ))}
              </div>
            )}
          </section>
          <MissionDossier
            mission={selectedMission}
            onEdit={openEdit}
            onFocus={onFocus}
            onClose={() => setSelectedId(undefined)}
            onDelete={() => selectedMission && setDeleteTarget(selectedMission)}
          />
        </div>
      </div>

      <AnimatePresence>
        {editorOpen && (
          <MissionEditor
            mission={editingMission}
            onClose={() => setEditorOpen(false)}
            onSaved={(mission) => {
              setEditorOpen(false);
              setSelectedId(mission.id);
            }}
          />
        )}
        {deleteTarget && (
          <DeleteDialog mission={deleteTarget} onClose={() => setDeleteTarget(undefined)} onDeleted={() => { setDeleteTarget(undefined); setSelectedId(undefined); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function compareMissions(left: Mission, right: Mission, sortKey: SortKey): number {
  if (sortKey === "title") return left.title.localeCompare(right.title);
  if (sortKey === "progress") return left.progress - right.progress;
  if (sortKey === "priority") return priorities.indexOf(left.priority) - priorities.indexOf(right.priority);
  if (sortKey === "difficulty") return difficulties.indexOf(left.difficulty) - difficulties.indexOf(right.difficulty);
  const leftDate = sortKey === "deadline" ? left.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER : left.updatedAt.getTime();
  const rightDate = sortKey === "deadline" ? right.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER : right.updatedAt.getTime();
  return leftDate - rightDate;
}

function FilterSelect({ label, value, options, onChange, compact = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <label className={`flex items-center gap-2 border border-white/10 bg-[#0b0b0b] px-3 ${compact ? "py-2" : "py-1"}`}>
      <span className="font-mono text-[8px] tracking-widest text-gray-600">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="max-w-[130px] bg-transparent text-[10px] text-gray-300 outline-none">
        {options.map((option) => <option key={option} value={option} className="bg-[#111]">{option}</option>)}
      </select>
    </label>
  );
}

function MissionCard({ mission, selected, onClick }: { mission: Mission; selected: boolean; onClick: () => void }) {
  const deadline = getDeadlineState(mission);
  return (
    <button onClick={onClick} className={`group w-full border p-4 text-left transition ${selected ? "border-yellow-400/40 bg-yellow-400/[0.06]" : "border-white/10 bg-[#0b0b0b] hover:border-yellow-400/20 hover:bg-white/[0.025]"}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${mission.completed ? "bg-green-400" : mission.priority === "CRITICAL" ? "bg-red-400" : "bg-yellow-400"}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] tracking-widest text-gray-600">
            <span>{mission.missionCode ?? missionCode(mission)}</span><span>/</span><span>{mission.category}</span><span className={priorityClass(mission.priority)}>{mission.priority}</span>
          </div>
          <h2 className={`mt-2 truncate text-base font-semibold ${mission.completed ? "text-gray-600 line-through" : "text-gray-200"}`}>{mission.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-gray-600">
            <span className="flex items-center gap-1"><Clock3 size={12} /> {formatDuration(mission.estimatedMinutes)}</span>
            <span className="flex items-center gap-1"><ListFilter size={12} /> {mission.subtasks.length} SUBTASKS</span>
            {deadline && <span className={deadline.className}>{deadline.label}</span>}
          </div>
        </div>
        <div className="hidden w-28 shrink-0 text-right sm:block">
          <p className="font-mono text-[9px] text-gray-600">PROGRESS</p>
          <p className="mt-1 font-mono text-sm text-yellow-400">{mission.progress}%</p>
          <div className="mt-2 h-1 bg-white/10"><div className="h-full bg-yellow-400" style={{ width: `${mission.progress}%` }} /></div>
        </div>
      </div>
    </button>
  );
}

function MissionDossier({ mission, onEdit, onFocus, onClose, onDelete }: { mission?: Mission; onEdit: (mission: Mission) => void; onFocus: () => void; onClose: () => void; onDelete: () => void }) {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  if (!mission) return <section className="hidden min-h-[520px] border border-dashed border-white/10 bg-[#0b0b0b] p-8 xl:block"><div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center"><ShieldAlert size={30} className="text-yellow-400/60" /><p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-gray-600">SELECT AN OPERATION</p><p className="mt-3 max-w-xs text-sm text-gray-700">Open a mission to inspect its classified dossier.</p></div></section>;

  const updateMission = async (changes: Partial<Mission>) => {
    if (!mission.id) return;
    await db.missions.update(mission.id, { ...changes, updatedAt: new Date() });
  };

  const toggleComplete = () => updateMission({ completed: !mission.completed, status: mission.completed ? "ACTIVE" : "COMPLETED", completedAt: mission.completed ? undefined : new Date() });
  const addSubtask = async () => {
    if (!subtaskTitle.trim() || !mission.id) return;
    const subtask: Subtask = { id: crypto.randomUUID(), title: subtaskTitle.trim(), completed: false, createdAt: new Date() };
    await updateMission({ subtasks: [...mission.subtasks, subtask] });
    setSubtaskTitle("");
  };
  const toggleSubtask = (subtask: Subtask) => {
    const completed = !subtask.completed;
    const subtasks = mission.subtasks.map((item) => item.id === subtask.id ? { ...item, completed, completedAt: completed ? new Date() : undefined } : item);
    const progress = subtasks.length ? Math.round((subtasks.filter((item) => item.completed).length / subtasks.length) * 100) : mission.progress;
    return updateMission({ subtasks, progress });
  };

  return (
    <motion.section layout initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="sticky top-5 max-h-[calc(100vh-40px)] overflow-y-auto border border-yellow-400/20 bg-[#0b0b0b] p-5 md:p-6">
      <div className="flex items-start justify-between border-b border-white/10 pb-5">
        <div><p className="font-mono text-[9px] tracking-[0.3em] text-yellow-400">BATCOM // CLASSIFIED</p><h2 className="mt-2 text-lg font-black">MISSION DOSSIER</h2><p className="mt-2 font-mono text-[9px] text-gray-600">{mission.missionCode ?? missionCode(mission)}</p></div>
        <button onClick={onClose} className="p-2 text-gray-600 hover:text-white xl:hidden"><X size={17} /></button>
      </div>
      <div className="py-6"><p className="font-mono text-[9px] tracking-widest text-gray-600">MISSION OBJECTIVE</p><h3 className="mt-2 text-2xl font-bold text-gray-100">{mission.title}</h3><div className="mt-4 flex flex-wrap gap-2"><span className={`border px-2 py-1 font-mono text-[9px] ${priorityClass(mission.priority)}`}>{mission.priority}</span><span className="border border-white/10 px-2 py-1 font-mono text-[9px] text-gray-500">{mission.difficulty}</span><span className="border border-white/10 px-2 py-1 font-mono text-[9px] text-gray-500">{mission.status}</span></div></div>
      <div className="space-y-6 text-sm">
        <DossierField label="DESCRIPTION" value={mission.description || "No description recorded."} />
        {mission.blockedReason && <DossierField label="BLOCK REASON" value={mission.blockedReason} alert />}
        <div><div className="flex items-center justify-between"><p className="font-mono text-[9px] tracking-widest text-gray-600">SUBTASKS // {mission.subtasks.filter((item) => item.completed).length}/{mission.subtasks.length}</p><span className="font-mono text-sm text-yellow-400">{mission.progress}%</span></div><div className="mt-2 h-1 bg-white/10"><div className="h-full bg-yellow-400" style={{ width: `${mission.progress}%` }} /></div><div className="mt-3 space-y-2">{mission.subtasks.map((subtask) => <button key={subtask.id} onClick={() => void toggleSubtask(subtask)} className="flex w-full items-center gap-3 text-left text-xs text-gray-400 hover:text-white"><span className={`flex h-4 w-4 items-center justify-center border ${subtask.completed ? "border-yellow-400 bg-yellow-400 text-black" : "border-gray-700"}`}>{subtask.completed && <Check size={11} />}</span><span className={subtask.completed ? "line-through opacity-50" : ""}>{subtask.title}</span></button>)}</div><div className="mt-3 flex gap-2"><input value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void addSubtask(); }} placeholder="Add subtask..." className="min-w-0 flex-1 border border-white/10 bg-black px-3 py-2 text-xs outline-none focus:border-yellow-400/40" /><button onClick={() => void addSubtask()} aria-label="Add subtask" className="border border-yellow-400/30 px-3 text-yellow-400"><Plus size={15} /></button></div></div>
        <div className="grid grid-cols-2 gap-3"><DossierMetric icon={<CalendarClock size={14} />} label="DEADLINE" value={formatDate(mission.deadline) ?? "OPEN"} /><DossierMetric icon={<Clock3 size={14} />} label="ESTIMATED" value={formatDuration(mission.estimatedMinutes)} /></div>
        <DossierField label="NOTES" value={mission.notes || "No notes attached."} />
        {mission.tags.length > 0 && <div><p className="font-mono text-[9px] tracking-widest text-gray-600">TAGS</p><div className="mt-2 flex flex-wrap gap-2">{mission.tags.map((tag) => <span key={tag} className="border border-white/10 px-2 py-1 font-mono text-[9px] text-gray-500">#{tag}</span>)}</div></div>}
        {mission.links.length > 0 && <div><p className="font-mono text-[9px] tracking-widest text-gray-600">LINKS</p><div className="mt-2 space-y-2">{mission.links.map((link) => <a key={link} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 truncate text-xs text-yellow-400 hover:text-yellow-300"><ExternalLink size={13} />{link}</a>)}</div></div>}
      </div>
      <div className="mt-7 grid grid-cols-2 gap-2 border-t border-white/10 pt-5"><button onClick={onFocus} className="bg-yellow-400 py-3 text-[10px] font-black tracking-widest text-black">START MISSION</button><button onClick={toggleComplete} className="border border-green-400/20 bg-green-400/5 py-3 text-[10px] font-bold tracking-widest text-green-400">{mission.completed ? "REOPEN" : "COMPLETE"}</button><button onClick={() => onEdit(mission)} className="flex items-center justify-center gap-2 border border-white/10 py-3 text-[10px] tracking-widest text-gray-400 hover:text-white"><Pencil size={13} /> EDIT</button><button onClick={() => void updateMission({ status: "ARCHIVED" })} className="flex items-center justify-center gap-2 border border-white/10 py-3 text-[10px] tracking-widest text-gray-400 hover:text-yellow-400"><Archive size={13} /> ARCHIVE</button></div>
      <button onClick={onDelete} className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-[9px] tracking-widest text-red-400/70 hover:text-red-400"><Trash2 size={13} /> DELETE PERMANENTLY</button>
    </motion.section>
  );
}

function MissionEditor({ mission, onClose, onSaved }: { mission?: Mission; onClose: () => void; onSaved: (mission: Mission) => void }) {
  const form = useForm<MissionFormValues>({ resolver: zodResolver(missionFormSchema) as never, defaultValues: mission ? formFromMission(mission) : emptyForm });
  const onSubmit = async (values: MissionFormValues) => {
    const existing = mission ?? missionDefaults({ title: values.title, createdAt: new Date() });
    const saved = missionDefaults({ ...existing, ...valuesToMission(values), updatedAt: new Date(), missionCode: existing.missionCode });
    const { id: _savedId, ...missionChanges } = saved;
    const id = mission?.id ? await db.missions.update(mission.id, missionChanges) && mission.id : await db.missions.add(saved);
    if (!mission?.id) {
      await db.missions.update(id, { missionCode: `OP-${String(id).padStart(4, "0")}` });
    }
    onSaved({ ...saved, id });
  };
  const error = form.formState.errors;
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] overflow-y-auto bg-black/85 p-4 backdrop-blur-md"><motion.form onSubmit={form.handleSubmit(onSubmit)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl border border-yellow-400/20 bg-[#0c0c0c] p-6 md:p-8"><div className="flex items-start justify-between border-b border-white/10 pb-5"><div><p className="font-mono text-[9px] tracking-[0.3em] text-yellow-400">BATCOM // MISSION EDITOR</p><h2 className="mt-2 text-2xl font-black">{mission ? "Edit Mission" : "Deploy New Mission"}</h2></div><button type="button" onClick={onClose} aria-label="Close mission editor" className="p-2 text-gray-600 hover:text-white"><X size={18} /></button></div><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="TITLE" error={error.title?.message} className="md:col-span-2"><input {...form.register("title")} autoFocus placeholder="Mission objective..." /></Field><Field label="DESCRIPTION" className="md:col-span-2"><textarea {...form.register("description")} rows={4} placeholder="What does success look like?" /></Field><Field label="CATEGORY" error={error.category?.message}><input {...form.register("category")} /></Field><Field label="TAGS"><input {...form.register("tags")} placeholder="React, AI, Priority" /></Field><SelectField label="THREAT LEVEL" {...form.register("priority")} options={priorities} /><SelectField label="DIFFICULTY" {...form.register("difficulty")} options={difficulties} /><SelectField label="STATUS" {...form.register("status")} options={statuses} /><Field label="ESTIMATED MINUTES" error={error.estimatedMinutes?.message}><input type="number" min="1" {...form.register("estimatedMinutes")} /></Field><Field label="START DATE"><input type="datetime-local" {...form.register("startDate")} /></Field><Field label="DEADLINE"><input type="datetime-local" {...form.register("deadline")} /></Field><Field label="BLOCK REASON"><input {...form.register("blockedReason")} placeholder="Required for blocked operations" /></Field><Field label="LINKS" error={error.links?.message}><input {...form.register("links")} placeholder="https://github.com/..." /></Field><Field label="NOTES" className="md:col-span-2"><textarea {...form.register("notes")} rows={4} placeholder="Private mission notes..." /></Field></div><div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="border border-white/10 px-5 py-3 text-xs tracking-widest text-gray-500 hover:text-white">CANCEL</button><button type="submit" className="bg-yellow-400 px-5 py-3 text-xs font-black tracking-widest text-black hover:bg-yellow-300">SAVE MISSION</button></div></motion.form></motion.div>;
}

function DeleteDialog({ mission, onClose, onDeleted }: { mission: Mission; onClose: () => void; onDeleted: () => void }) {
  const remove = async () => { if (mission.id) await db.missions.delete(mission.id); onDeleted(); };
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md border border-red-400/25 bg-[#0d0d0d] p-6"><p className="font-mono text-[9px] tracking-[0.3em] text-red-400">BATCOM // DESTRUCTIVE ACTION</p><h2 className="mt-3 text-xl font-bold">Permanently delete mission?</h2><p className="mt-3 text-sm leading-6 text-gray-500">{mission.title}<br />This action cannot be undone.</p><div className="mt-6 flex gap-3"><button onClick={onClose} className="flex-1 border border-white/10 py-3 text-xs tracking-widest text-gray-500">CANCEL</button><button onClick={() => void remove()} className="flex-1 bg-red-500/90 py-3 text-xs font-bold tracking-widest text-white">DELETE</button></div></motion.div></motion.div>;
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="font-mono text-[9px] tracking-widest text-gray-600">{label}</span><div className="mt-2 [&>input]:w-full [&>input]:border [&>input]:border-white/10 [&>input]:bg-black [&>input]:px-3 [&>input]:py-3 [&>input]:text-sm [&>input]:text-white [&>input]:outline-none [&>input]:focus:border-yellow-400/40 [&>textarea]:w-full [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black [&>textarea]:px-3 [&>textarea]:py-3 [&>textarea]:text-sm [&>textarea]:text-white [&>textarea]:outline-none [&>textarea]:focus:border-yellow-400/40">{children}</div>{error && <span className="mt-1 block text-[10px] text-red-400">{error}</span>}</label>; }
function SelectField({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) { return <label className="block"><span className="font-mono text-[9px] tracking-widest text-gray-600">{label}</span><select {...props} className="mt-2 w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/40">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function DossierField({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) { return <div><p className="font-mono text-[9px] tracking-widest text-gray-600">{label}</p><p className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${alert ? "text-red-300" : "text-gray-400"}`}>{value}</p></div>; }
function DossierMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="border border-white/10 bg-black/30 p-3"><div className="flex items-center gap-2 text-yellow-400">{icon}<span className="font-mono text-[8px] tracking-widest text-gray-600">{label}</span></div><p className="mt-2 text-sm text-gray-300">{value}</p></div>; }
function EmptyMissions({ hasFilters, onCreate }: { hasFilters: boolean; onCreate: () => void }) { return <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-white/10 bg-[#0b0b0b] p-8 text-center"><ShieldAlert size={32} className="text-yellow-400/60" /><h2 className="mt-5 font-mono text-xs tracking-[0.3em] text-gray-500">{hasFilters ? "NO MATCHING OPERATIONS" : "NO ACTIVE OPERATIONS"}</h2><p className="mt-3 text-sm text-gray-700">{hasFilters ? "Try another query or clear the filters." : "Gotham is quiet. Deploy the first mission."}</p>{!hasFilters && <button onClick={onCreate} className="mt-6 border border-yellow-400/30 px-5 py-3 text-[10px] font-bold tracking-widest text-yellow-400">DEPLOY FIRST MISSION</button>}</div>; }

function formFromMission(mission: Mission): MissionFormValues { return { title: mission.title, description: mission.description, category: mission.category, tags: mission.tags.join(", "), priority: mission.priority, difficulty: mission.difficulty, status: mission.status, startDate: toInputDate(mission.startDate), deadline: toInputDate(mission.deadline), estimatedMinutes: mission.estimatedMinutes, notes: mission.notes, links: mission.links.join(", "), blockedReason: mission.blockedReason ?? "", recurrenceEnabled: mission.recurrence?.enabled ?? false, recurrenceFrequency: mission.recurrence?.frequency ?? null, recurrenceInterval: mission.recurrence?.interval ?? 1, recurrenceDays: mission.recurrence?.daysOfWeek?.join(", ") ?? "", recurrenceEndDate: toInputDate(mission.recurrence?.endDate), subtasks: mission.subtasks, progress: mission.progress }; }
function valuesToMission(values: MissionFormValues): Partial<Mission> { return { title: values.title.trim(), description: values.description, category: values.category.trim().toUpperCase(), tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean), priority: values.priority, difficulty: values.difficulty, status: values.status, startDate: fromInputDate(values.startDate), deadline: fromInputDate(values.deadline), estimatedMinutes: values.estimatedMinutes, duration: formatDuration(values.estimatedMinutes), notes: values.notes, links: values.links.split(",").map((link) => link.trim()).filter(Boolean), blockedReason: values.blockedReason || undefined, completed: values.status === "COMPLETED", completedAt: values.status === "COMPLETED" ? new Date() : undefined }; }
function missionCode(mission: Mission): string { return `OP-${String(mission.id ?? 0).padStart(4, "0")}`; }
function formatDuration(minutes: number): string { if (minutes < 60) return `${minutes}M`; const hours = Math.floor(minutes / 60); const remainder = minutes % 60; return remainder ? `${hours}H ${remainder}M` : `${hours}H`; }
function toInputDate(date?: Date): string { return date ? new Date(date).toISOString().slice(0, 16) : ""; }
function fromInputDate(value: string): Date | undefined { return value ? new Date(value) : undefined; }
function formatDate(date?: Date): string | undefined { return date ? new Date(date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : undefined; }
function priorityClass(priority: MissionPriority): string { return priority === "CRITICAL" ? "text-red-400 border-red-400/30" : priority === "HIGH" ? "text-orange-400 border-orange-400/30" : priority === "LOW" ? "text-blue-300 border-blue-300/20" : "text-yellow-400 border-yellow-400/30"; }
function getDeadlineState(mission: Mission): { label: string; className: string } | undefined { if (mission.completed) return { label: "COMPLETED", className: "text-green-400" }; if (!mission.deadline) return undefined; const now = Date.now(); const deadline = new Date(mission.deadline).getTime(); if (deadline < now) return { label: "OVERDUE", className: "text-red-400" }; if (deadline - now < 48 * 60 * 60 * 1000) return { label: "DUE SOON", className: "text-orange-400" }; return { label: "FUTURE", className: "text-gray-500" }; }