import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Check, LoaderCircle, RefreshCw, Send, Sparkles, X } from "lucide-react";
import { generateMissionFromPrompt } from "../../services/ai/aiService";
import { generatedMissionSchema, type GeneratedMission } from "../../schemas/aiMissionSchema";
import { db, missionDefaults } from "../../db/database";
import type { Mission } from "../../db/database";
import MissionEditor from "../missions/MissionEditor";

type Props = {
  onClose: () => void;
  onDeployed?: () => void;
};

const examplePrompt = "Create a mission to prepare for my AI interview next Friday. I need to study Python, ML, SQL and aptitude.";

export default function AIMissionGenerator({ onClose, onDeployed }: Props) {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<GeneratedMission>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const analyze = async () => {
    if (!prompt.trim()) {
      setError("Describe an objective before analysis.");
      return;
    }
    setLoading(true);
    setError("");
    setGenerated(undefined);
    try {
      const result = await generateMissionFromPrompt(prompt);
      setGenerated(result.mission);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Intelligence analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateGenerated = (changes: Partial<GeneratedMission>) => {
    if (!generated) return;
    const next = generatedMissionSchema.safeParse({ ...generated, ...changes });
    if (next.success) setGenerated(next.data);
  };

  const deploy = async () => {
    if (!generated) return;
    const validated = generatedMissionSchema.safeParse(generated);
    if (!validated.success) {
      setError("The generated dossier is incomplete. Review the highlighted fields.");
      return;
    }
    const mission = missionDefaults({
      title: validated.data.title,
      description: validated.data.description,
      category: validated.data.category,
      tags: validated.data.tags,
      priority: validated.data.priority,
      difficulty: validated.data.difficulty,
      status: validated.data.status,
      estimatedMinutes: validated.data.estimatedMinutes,
      duration: formatDuration(validated.data.estimatedMinutes),
      deadline: parseDate(validated.data.deadline),
      startDate: parseDate(validated.data.startDate),
      notes: validated.data.notes,
      links: validated.data.links,
      blockedReason: validated.data.blockedReason || undefined,
      recurrence: validated.data.recurrence.frequency ? {
        enabled: validated.data.recurrence.enabled,
        frequency: validated.data.recurrence.frequency,
        interval: validated.data.recurrence.interval,
        daysOfWeek: validated.data.recurrence.daysOfWeek,
        endDate: parseDate(validated.data.recurrence.endDate),
      } : undefined,
      subtasks: validated.data.subtasks.map((subtask) => ({
        id: crypto.randomUUID(),
        title: subtask.title,
        completed: false,
        createdAt: new Date(),
      })),
      createdAt: new Date(),
    });
    const id = await db.missions.add(mission);
    await db.missions.update(id, {
      missionCode: `OP-${String(id).padStart(4, "0")}`,
    });
    setDeployed(true);
    onDeployed?.();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto my-5 max-w-5xl border border-yellow-400/20 bg-[#0b0b0b] shadow-[0_0_90px_rgba(250,204,21,.08)]">
          <header className="flex items-start justify-between border-b border-white/10 p-5 md:p-7">
            <div className="flex items-start gap-3"><div className="border border-yellow-400/20 bg-yellow-400/5 p-2 text-yellow-400"><BrainCircuit size={19} /></div><div><p className="font-mono text-[9px] tracking-[0.35em] text-yellow-400">BATCOM // INTELLIGENCE LINK</p><h2 className="mt-2 text-xl font-black md:text-2xl">Natural-Language Mission Generator</h2><p className="mt-2 text-xs text-gray-600">Describe the objective. Review the dossier. Deploy only when it is correct.</p></div></div>
            <button onClick={onClose} aria-label="Close AI mission generator" className="p-2 text-gray-600 hover:text-white"><X size={18} /></button>
          </header>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r md:p-7">
              <p className="font-mono text-[9px] tracking-[0.3em] text-gray-600">INPUT CHANNEL</p>
              <label className="mt-4 block"><span className="font-mono text-[10px] tracking-widest text-gray-500">DESCRIBE YOUR OBJECTIVE</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void analyze(); }} rows={8} placeholder={examplePrompt} className="mt-3 w-full resize-y border border-white/10 bg-black p-4 text-sm leading-6 text-gray-200 outline-none placeholder:text-gray-700 focus:border-yellow-400/40" /></label>
              <button onClick={() => setPrompt(examplePrompt)} className="mt-3 text-left text-[10px] leading-5 text-gray-600 hover:text-yellow-400">LOAD EXAMPLE OBJECTIVE</button>
              <button onClick={() => void analyze()} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 bg-yellow-400 py-4 text-xs font-black tracking-[0.2em] text-black hover:bg-yellow-300 disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />} {loading ? "ANALYZING OBJECTIVE" : "ANALYZE MISSION"}</button>
              {error && <div className="mt-4 border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-300">INTELLIGENCE LINK UNAVAILABLE<br />{error}</div>}
              {loading && <div className="mt-6 space-y-3 font-mono text-[9px] tracking-widest text-gray-600"><ScanLine text="EXTRACTING MISSION PARAMETERS..." /><ScanLine text="IDENTIFYING OPERATIONAL REQUIREMENTS..." /><ScanLine text="PREPARING MISSION DOSSIER..." /></div>}
            </div>

            <div className="min-h-[470px] p-5 md:p-7">
              {deployed ? <DeployedState onClose={onClose} /> : generated ? <MissionPreview mission={generated} onChange={updateGenerated} onEdit={() => setEditorOpen(true)} onDeploy={() => void deploy()} onRegenerate={() => void analyze()} onCancel={onClose} /> : <EmptyIntelligence />}
            </div>
          </div>
        </motion.section>
        {editorOpen && generated && <MissionEditor mission={generatedToMission(generated)} persist={false} onClose={() => setEditorOpen(false)} onSaved={(mission) => { setGenerated(missionToGenerated(mission)); setEditorOpen(false); }} />}
      </motion.div>
    </AnimatePresence>
  );
}

function MissionPreview({ mission, onChange, onEdit, onDeploy, onRegenerate, onCancel }: { mission: GeneratedMission; onChange: (changes: Partial<GeneratedMission>) => void; onEdit: () => void; onDeploy: () => void; onRegenerate: () => void; onCancel: () => void }) {
  return <div><div className="flex items-start justify-between"><div><p className="font-mono text-[9px] tracking-[0.3em] text-yellow-400">BATCOM INTELLIGENCE REPORT</p><h3 className="mt-2 text-xl font-black">MISSION GENERATED</h3><p className="mt-2 font-mono text-[10px] text-gray-600">OP-PENDING // REVIEW REQUIRED</p></div><Sparkles size={19} className="text-yellow-400" /></div><div className="mt-6 space-y-5"><PreviewField label="TITLE"><input value={mission.title} onChange={(event) => onChange({ title: event.target.value })} /></PreviewField><PreviewField label="DESCRIPTION"><textarea value={mission.description} onChange={(event) => onChange({ description: event.target.value })} rows={3} /></PreviewField><div className="grid gap-3 sm:grid-cols-3"><PreviewField label="THREAT"><select value={mission.priority} onChange={(event) => onChange({ priority: event.target.value as GeneratedMission["priority"] })}>{["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((item) => <option key={item}>{item}</option>)}</select></PreviewField><PreviewField label="DIFFICULTY"><select value={mission.difficulty} onChange={(event) => onChange({ difficulty: event.target.value as GeneratedMission["difficulty"] })}>{["EASY", "NORMAL", "HARD", "EXTREME"].map((item) => <option key={item}>{item}</option>)}</select></PreviewField><PreviewField label="ESTIMATED MINUTES"><input type="number" min="1" value={mission.estimatedMinutes} onChange={(event) => onChange({ estimatedMinutes: Number(event.target.value) })} /></PreviewField></div><div className="grid gap-3 sm:grid-cols-2"><PreviewField label="OPERATION TYPE"><input value={mission.category} onChange={(event) => onChange({ category: event.target.value })} /></PreviewField><PreviewField label="DEADLINE"><input type="date" value={mission.deadline ?? ""} onChange={(event) => onChange({ deadline: event.target.value || null })} /></PreviewField></div><div><p className="font-mono text-[9px] tracking-widest text-gray-600">TAGS</p><div className="mt-2 flex flex-wrap gap-2">{mission.tags.map((tag) => <span key={tag} className="border border-white/10 px-2 py-1 font-mono text-[9px] text-gray-500">#{tag}</span>)}</div></div><div><div className="flex items-center justify-between"><p className="font-mono text-[9px] tracking-widest text-gray-600">SUBTASKS // {mission.subtasks.length}</p><span className="font-mono text-[9px] text-yellow-400">{mission.recurrence.enabled ? `RECURRING ${mission.recurrence.frequency}` : "ONE-TIME OPERATION"}</span></div><div className="mt-2 space-y-2">{mission.subtasks.map((subtask) => <div key={subtask.title} className="flex items-center gap-3 text-sm text-gray-400"><span className="h-4 w-4 border border-gray-700" />{subtask.title}</div>)}</div></div></div><div className="mt-7 grid gap-2 border-t border-white/10 pt-5 sm:grid-cols-4"><button onClick={onEdit} className="border border-yellow-400/30 py-3 text-[10px] font-bold tracking-widest text-yellow-400">EDIT MISSION</button><button onClick={onDeploy} className="bg-yellow-400 py-3 text-[10px] font-black tracking-widest text-black">DEPLOY MISSION</button><button onClick={onRegenerate} className="flex items-center justify-center gap-2 border border-white/10 py-3 text-[10px] tracking-widest text-gray-500 hover:text-yellow-400"><RefreshCw size={13} /> REGENERATE</button><button onClick={onCancel} className="border border-white/10 py-3 text-[10px] tracking-widest text-gray-500 hover:text-white">CANCEL</button></div></div>;
}

function generatedToMission(mission: GeneratedMission): Mission {
  return missionDefaults({ title: mission.title, description: mission.description, category: mission.category, tags: mission.tags, priority: mission.priority, difficulty: mission.difficulty, status: mission.status, estimatedMinutes: mission.estimatedMinutes, deadline: parseDate(mission.deadline), startDate: parseDate(mission.startDate), notes: mission.notes, links: mission.links, blockedReason: mission.blockedReason || undefined, recurrence: mission.recurrence.frequency ? { enabled: mission.recurrence.enabled, frequency: mission.recurrence.frequency, interval: mission.recurrence.interval, daysOfWeek: mission.recurrence.daysOfWeek, endDate: parseDate(mission.recurrence.endDate) } : undefined, subtasks: mission.subtasks.map((subtask) => ({ id: crypto.randomUUID(), title: subtask.title, completed: false, createdAt: new Date() })), createdAt: new Date() });
}

function missionToGenerated(mission: Mission): GeneratedMission {
  return { title: mission.title, description: mission.description, category: mission.category, tags: mission.tags, priority: mission.priority, difficulty: mission.difficulty, status: mission.status, estimatedMinutes: mission.estimatedMinutes, deadline: mission.deadline ? new Date(mission.deadline).toISOString().slice(0, 10) : null, startDate: mission.startDate ? new Date(mission.startDate).toISOString().slice(0, 10) : null, notes: mission.notes, links: mission.links, blockedReason: mission.blockedReason ?? "", recurrence: { enabled: mission.recurrence?.enabled ?? false, frequency: mission.recurrence?.frequency ?? null, interval: mission.recurrence?.interval ?? 1, daysOfWeek: mission.recurrence?.daysOfWeek ?? [], endDate: mission.recurrence?.endDate ? new Date(mission.recurrence.endDate).toISOString().slice(0, 10) : null }, subtasks: mission.subtasks.map((subtask) => ({ title: subtask.title, estimatedMinutes: 30 })) };
}

function PreviewField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="font-mono text-[9px] tracking-widest text-gray-600">{label}</span><div className="mt-2 [&>input]:w-full [&>input]:border [&>input]:border-white/10 [&>input]:bg-black [&>input]:px-3 [&>input]:py-3 [&>input]:text-sm [&>input]:text-gray-200 [&>input]:outline-none [&>input]:focus:border-yellow-400/40 [&>textarea]:w-full [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black [&>textarea]:p-3 [&>textarea]:text-sm [&>textarea]:text-gray-200 [&>textarea]:outline-none [&>select]:w-full [&>select]:border [&>select]:border-white/10 [&>select]:bg-black [&>select]:px-3 [&>select]:py-3 [&>select]:text-sm [&>select]:text-gray-200">{children}</div></label>; }
function ScanLine({ text }: { text: string }) { return <motion.p initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.8 }}>{text}</motion.p>; }
function EmptyIntelligence() { return <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><BrainCircuit size={35} className="text-yellow-400/60" /><p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-gray-500">AWAITING OBJECTIVE</p><p className="mt-3 max-w-sm text-sm leading-6 text-gray-700">BATCOM will propose a structured mission for your review. Nothing is saved until you deploy it.</p></div>; }
function DeployedState({ onClose }: { onClose: () => void }) { return <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center border border-green-400/30 bg-green-400/10 text-green-400"><Check size={25} /></div><p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-green-400">MISSION DEPLOYED</p><p className="mt-3 text-sm text-gray-500">The operation has been added to your local mission system.</p><button onClick={onClose} className="mt-6 border border-yellow-400/30 px-5 py-3 text-[10px] font-bold tracking-widest text-yellow-400">RETURN TO COMMAND</button></div>; }
function parseDate(value: string | null): Date | undefined { return value ? new Date(`${value}T09:00:00`) : undefined; }
function formatDuration(minutes: number): string { if (minutes < 60) return `${minutes}M`; const hours = Math.floor(minutes / 60); const remainder = minutes % 60; return remainder ? `${hours}H ${remainder}M` : `${hours}H`; }
