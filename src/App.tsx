import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Crosshair,
  Flame,
  Focus,
  LayoutDashboard,
  ListTodo,
  Menu,
  Pause,
  Plus,
  Search,
  Settings,
  Shield,
  Target,
  Trophy,
  X,
  Zap,
  Play,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  db,
  missionDefaults,
  type Mission as StoredMission,
} from "./db/database";
import MissionWorkspace from "./components/missions/MissionWorkspace";
import AIMissionGenerator from "./components/ai/AIMissionGenerator";

/* =========================================================
   TYPES
========================================================= */

type Mission = {
  id?: number;
  title: string;
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  duration: string;
  completed: boolean;
};

function toStoredMission(mission: Mission): StoredMission {
  return missionDefaults({
    title: mission.title,
    category: mission.category,
    priority: mission.priority,
    duration: mission.duration,
    estimatedMinutes: 30,
    completed: mission.completed,
    status: mission.completed ? "COMPLETED" : "ACTIVE",
    createdAt: new Date(),
  });
}

function fromStoredMission(mission: StoredMission): Mission {
  return {
    id: mission.id ?? Date.now(),
    title: mission.title,
    category: mission.category,
    priority: mission.priority,
    duration: mission.duration,
    completed: mission.completed,
  };
}

/* =========================================================
   DEMO MISSIONS
========================================================= */

const initialMissions: Mission[] = [
  {
    id: 1,
    title: "Complete IoT Standardization Notes",
    category: "COLLEGE",
    priority: "CRITICAL",
    duration: "1H 30M",
    completed: false,
  },
  {
    id: 2,
    title: "Practice Java Assessment MCQs",
    category: "INTERVIEW",
    priority: "HIGH",
    duration: "45M",
    completed: false,
  },
  {
    id: 3,
    title: "Continue BATCOM Development",
    category: "PROJECT",
    priority: "HIGH",
    duration: "2H",
    completed: false,
  },
  {
    id: 4,
    title: "Complete AI/ML Course Module",
    category: "LEARNING",
    priority: "MEDIUM",
    duration: "1H",
    completed: true,
  },
];

/* =========================================================
   BAT EMBLEM
========================================================= */

function BatEmblem({
  size = 300,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size * 0.52}
      viewBox="0 0 420 220"
      fill="none"
      className="drop-shadow-[0_0_35px_rgba(250,204,21,0.55)]"
    >
      <path
        d="
        M210 105
        C185 82 158 67 125 64
        C145 80 151 92 151 105
        C120 89 87 83 48 86
        C74 103 95 116 116 128
        C88 124 58 130 28 145
        C69 151 103 164 137 176
        C160 183 184 178 210 156

        C236 178 260 183 283 176
        C317 164 351 151 392 145
        C362 130 332 124 304 128
        C325 116 346 103 372 86
        C333 83 300 89 269 105
        C269 92 275 80 295 64
        C262 67 235 82 210 105
        Z"
        fill="currentColor"
        className="text-yellow-400"
      />

      <path
        d="M210 105 L196 75 L210 87 L224 75 Z"
        fill="#050505"
      />
    </svg>
  );
}

/* =========================================================
   CINEMATIC INTRO
========================================================= */

function BatSignalIntro({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 700),
      setTimeout(() => setStage(2), 1800),
      setTimeout(() => setStage(3), 3100),
      setTimeout(() => setStage(4), 4300),
      setTimeout(() => onComplete(), 5700),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-black"
    >
      {/* atmospheric glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(250,204,21,0.10),transparent_32%)]" />

      {/* subtle grid */}

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* rain */}

      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 55 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-16 w-px bg-white"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 19) % 100}%`,
            }}
            animate={{
              y: ["-100px", "110vh"],
            }}
            transition={{
              duration: 1 + (i % 5) * 0.3,
              repeat: Infinity,
              ease: "linear",
              delay: (i % 8) * 0.2,
            }}
          />
        ))}
      </div>

      {/* Gotham skyline */}

      <div className="absolute bottom-0 left-0 right-0 h-[25%]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 bg-[#050505]"
            style={{
              left: `${i * 3.7}%`,
              width: `${2 + (i % 3)}%`,
              height: `${25 + ((i * 17) % 75)}%`,
            }}
          >
            <div className="absolute left-1/2 top-4 h-1 w-1 bg-yellow-400/30" />
            <div className="absolute left-1/3 top-10 h-1 w-1 bg-yellow-400/20" />
          </div>
        ))}
      </div>

      {/* Bat signal */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.1,
        }}
        animate={{
          opacity: stage >= 1 ? 0.35 : 0,
          scale: stage >= 1 ? 1 : 0.1,
        }}
        transition={{
          duration: 1.5,
        }}
        className="absolute left-1/2 top-[50%] h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400 blur-[130px]"
      />

      {/* emblem */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.25,
          rotate: -8,
        }}
        animate={{
          opacity: stage >= 2 ? 1 : 0,
          scale: stage >= 2 ? 1 : 0.25,
          rotate: 0,
        }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
        }}
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
      >
        <BatEmblem size={430} />
      </motion.div>

      {/* title */}

      <AnimatePresence>
        {stage >= 3 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="absolute left-0 right-0 top-[66%] text-center"
          >
            <h1 className="text-5xl font-black tracking-[0.45em] text-yellow-400 md:text-7xl">
              BATCOM
            </h1>

            <p className="mt-4 text-[10px] tracking-[0.55em] text-gray-500 md:text-xs">
              PRIVATE COMMAND NETWORK
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* boot sequence */}

      {stage >= 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-[10%] left-0 right-0 text-center"
        >
          <p className="font-mono text-[10px] tracking-[0.4em] text-gray-500">
            SYSTEM INITIALIZING
          </p>

          <div className="mx-auto mt-3 h-1 w-64 overflow-hidden bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1 }}
              className="h-full bg-yellow-400"
            />
          </div>

          <p className="mt-3 font-mono text-[9px] tracking-[0.35em] text-yellow-400">
            GOTHAM NETWORK // ONLINE
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarItem({
  icon,
  title,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
        active
          ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-400"
          : "border-transparent text-gray-500 hover:border-white/5 hover:bg-white/[0.03] hover:text-white"
      }`}
    >
      {icon}

      <span>{title}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
      )}
    </button>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] p-5"
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-yellow-400/5 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-600">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-2 text-yellow-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-gray-600">
        {subtitle}
      </p>
    </motion.div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressBar({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>

        <span className="font-mono text-yellow-400">
          {value}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 1,
          }}
          className="h-full bg-yellow-400"
        />
      </div>
    </div>
  );
}

/* =========================================================
   MISSION ROW
========================================================= */

function MissionRow({
  mission,
  onToggle,
}: {
  mission: Mission;
  onToggle: () => void;
}) {
  const priority = {
    CRITICAL: "text-red-400 border-red-500/20 bg-red-500/5",
    HIGH: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    MEDIUM: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
    LOW: "text-blue-400 border-blue-500/20 bg-blue-500/5",
  };

  return (
    <motion.div
      layout
      className="group flex items-center gap-4 border-b border-white/5 p-4 transition hover:bg-white/[0.025]"
    >
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
          mission.completed
            ? "border-yellow-400 bg-yellow-400 text-black"
            : "border-gray-700 hover:border-yellow-400"
        }`}
      >
        {mission.completed && <Check size={15} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-gray-700">
            OP-{String(mission.id).padStart(3, "0")}
          </span>

          <span className="text-gray-700">/</span>

          <span className="text-[9px] tracking-widest text-gray-600">
            {mission.category}
          </span>
        </div>

        <p
          className={`mt-1 truncate text-sm font-medium ${
            mission.completed
              ? "text-gray-700 line-through"
              : "text-gray-200"
          }`}
        >
          {mission.title}
        </p>
      </div>

      <div className="hidden items-center gap-5 md:flex">
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <Clock3 size={13} />
          {mission.duration}
        </div>

        <span
          className={`rounded border px-2 py-1 text-[9px] font-bold tracking-wider ${priority[mission.priority]}`}
        >
          {mission.priority}
        </span>

        <ChevronRight
          size={16}
          className="text-gray-700 transition group-hover:text-yellow-400"
        />
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [intro, setIntro] = useState(true);

  const [missions, setMissions] =
    useState<Mission[]>(initialMissions);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [newMissionOpen, setNewMissionOpen] =
    useState(false);

  const [missionTitle, setMissionTitle] =
    useState("");

  const [activeView, setActiveView] =
    useState<"dashboard" | "missions">("dashboard");

  const [focusOpen, setFocusOpen] = useState(false);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusDuration, setFocusDuration] = useState(25);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiGeneratorOpen, setAIGeneratorOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadMissions = async () => {
      try {
        const missionsFromDatabase = await db.transaction(
          "rw",
          db.missions,
          async () => {
            if ((await db.missions.count()) === 0) {
              await db.missions.bulkAdd(
                initialMissions.map(toStoredMission),
              );
            }

            return db.missions.toArray();
          },
        );

        if (active) {
          setMissions(missionsFromDatabase.map(fromStoredMission));
        }
      } catch (error) {
        console.error("BATCOM mission storage unavailable", error);
      }
    };

    void loadMissions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!focusRunning) return;

    const timer = window.setInterval(() => {
      setFocusSeconds((seconds) => {
        if (seconds <= 1) {
          setFocusRunning(false);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [focusRunning]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }

      if (event.key === "Escape") {
        setPaletteOpen(false);
        setFocusOpen(false);
        setFocusRunning(false);
        setNewMissionOpen(false);
        setAIGeneratorOpen(false);
        (document.activeElement as HTMLElement | null)?.blur();
        return;
      }

      if (isTyping) return;

      if (event.key.toLowerCase() === "n") setNewMissionOpen(true);
      if (event.key.toLowerCase() === "f") setFocusOpen(true);
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const completedCount = missions.filter(
    (mission) => mission.completed,
  ).length;

  const remainingCount =
    missions.length - completedCount;

  const completionPercentage =
    missions.length === 0
      ? 0
      : Math.round(
          (completedCount / missions.length) * 100,
        );

  const toggleMission = (id: number) => {
    setMissions((current) => {
      const mission = current.find((item) => item.id === id);
      if (!mission) return current;

      const completed = !mission.completed;
      void db.missions.update(id, {
        completed,
        status: completed ? "COMPLETED" : "ACTIVE",
        completedAt: completed ? new Date() : undefined,
      });

      return current.map((item) =>
        item.id === id ? { ...item, completed } : item,
      );
    });
  };

  const addMission = async () => {
    if (!missionTitle.trim()) return;

    const draftMission: Mission = {
      title: missionTitle,
      category: "PERSONAL",
      priority: "MEDIUM",
      duration: "30M",
      completed: false,
    };

    const storedId = await db.missions.add(toStoredMission(draftMission));
    const newMission = { ...draftMission, id: storedId };
    await db.missions.update(storedId, {
      missionCode: `OP-${String(storedId).padStart(4, "0")}`,
    });
    setMissions((current) => [newMission, ...current]);

    setMissionTitle("");
    setNewMissionOpen(false);
  };

  const activeMission =
    missions.find((mission) => !mission.completed) ?? missions[0];

  const openFocusChamber = () => {
    setFocusOpen(true);
    setPaletteOpen(false);
  };

  const closeFocusChamber = () => {
    setFocusOpen(false);
    setFocusRunning(false);
  };

  const openAIGenerator = () => {
    setAIGeneratorOpen(true);
    setPaletteOpen(false);
  };

  const resetFocusTimer = (minutes = focusDuration) => {
    setFocusDuration(minutes);
    setFocusSeconds(minutes * 60);
    setFocusRunning(false);
  };

  const focusClock = `${String(Math.floor(focusSeconds / 60)).padStart(2, "0")}:${String(focusSeconds % 60).padStart(2, "0")}`;

  return (
    <>
      {/* =====================================================
          CINEMATIC INTRO
      ===================================================== */}

      <AnimatePresence>
        {intro && (
          <BatSignalIntro
            onComplete={() => setIntro(false)}
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          APPLICATION
      ===================================================== */}

      <div className="min-h-screen bg-[#070707] text-white">
        {/* MOBILE HEADER */}

        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/85 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-white/10 bg-white/5 p-2"
          >
            <Menu size={19} />
          </button>

          <div className="flex items-center gap-2">
            <BatEmblem size={48} />

            <span className="text-sm font-black tracking-[0.3em] text-yellow-400">
              BATCOM
            </span>
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            className="rounded-lg border border-white/10 bg-white/5 p-2"
          >
            <Search size={19} />
          </button>
        </header>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#080808] transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* logo */}

          <div className="flex h-24 items-center border-b border-white/10 px-5">
            <BatEmblem size={70} />

            <div>
              <div className="font-black tracking-[0.35em] text-yellow-400">
                BATCOM
              </div>

              <div className="mt-1 font-mono text-[8px] tracking-[0.25em] text-gray-600">
                WAYNE // PRIVATE NETWORK
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* system status */}

          <div className="mx-4 mt-5 rounded-lg border border-yellow-400/10 bg-yellow-400/[0.025] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-widest text-gray-600">
                SYSTEM STATUS
              </span>

              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            </div>

            <p className="mt-2 font-mono text-xs text-green-400">
              GOTHAM NETWORK ONLINE
            </p>
          </div>

          {/* navigation */}

          <nav className="mt-5 space-y-1 px-4">
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              title="Command Center"
              active={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
            />

            <SidebarItem
              icon={<ListTodo size={18} />}
              title="Active Missions"
              active={activeView === "missions"}
              onClick={() => setActiveView("missions")}
            />

            <SidebarItem
              icon={<CalendarDays size={18} />}
              title="Mission Calendar"
            />

            <SidebarItem
              icon={<Focus size={18} />}
              title="Focus Chamber"
              onClick={openFocusChamber}
            />

            <SidebarItem
              icon={<Target size={18} />}
              title="Strategic Goals"
            />

            <SidebarItem
              icon={<BarChart3 size={18} />}
              title="Intelligence"
            />

            <SidebarItem
              icon={<Trophy size={18} />}
              title="Achievements"
            />

            <div className="my-5 border-t border-white/5" />

            <SidebarItem
              icon={<Settings size={18} />}
              title="System Settings"
            />
          </nav>

          {/* bottom */}

          <div className="absolute bottom-5 left-4 right-4">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <Shield
                  size={17}
                  className="text-yellow-400"
                />

                <div>
                  <p className="text-[10px] font-semibold">
                    SECURITY LEVEL
                  </p>

                  <p className="mt-1 font-mono text-[9px] text-gray-600">
                    PRIVATE // LOCAL
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ===================================================
            MAIN
        =================================================== */}

        {activeView === "missions" ? (
          <MissionWorkspace
            onBack={() => setActiveView("dashboard")}
            onFocus={openFocusChamber}
          />
        ) : (
        <main className="min-h-screen pt-20 lg:ml-72 lg:pt-0">
          <div className="mx-auto max-w-[1700px] p-4 md:p-7 lg:p-10">
            {/* TOP BAR */}

            <div className="flex flex-col gap-6 border-b border-white/5 pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />

                  <span className="font-mono text-[9px] tracking-[0.35em] text-yellow-400">
                    COMMAND CENTER // ACTIVE
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                  Good Evening,
                  <br />
                  <span className="text-gray-500">
                    Commander.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600">
                  All Gotham operations are being
                  monitored. Your mission queue is
                  ready for deployment.
                </p>
              </div>

              <button
                onClick={() =>
                  setNewMissionOpen(true)
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400 px-5 py-3 text-xs font-black tracking-wider text-black transition hover:bg-yellow-300"
              >
                <Plus size={17} />
                DEPLOY NEW MISSION
              </button>
            </div>

            {/* =================================================
                STAT GRID
            ================================================= */}

            <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                icon={<Crosshair size={18} />}
                title="OPERATIONS"
                value={`${completedCount}/${missions.length}`}
                subtitle={`${remainingCount} missions remaining`}
              />

              <StatCard
                icon={<Flame size={18} />}
                title="STREAK"
                value="06 DAYS"
                subtitle="Personal record: 11 days"
              />

              <StatCard
                icon={<Activity size={18} />}
                title="EFFICIENCY"
                value="87%"
                subtitle="+12% from last week"
              />

              <StatCard
                icon={<Focus size={18} />}
                title="FOCUS TIME"
                value="03H 42M"
                subtitle="Target: 05H 00M"
              />
            </div>

            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="mt-7 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
              {/* MISSIONS */}

              <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] tracking-[0.3em] text-yellow-400">
                        OPERATIONS
                      </span>

                      <span className="rounded bg-red-500/10 px-2 py-0.5 font-mono text-[8px] text-red-400">
                        LIVE
                      </span>
                    </div>

                    <h2 className="mt-2 text-lg font-bold">
                      Active Mission Queue
                    </h2>
                  </div>

                  <button className="hidden text-[10px] tracking-widest text-gray-600 hover:text-yellow-400 sm:block">
                    VIEW ALL
                  </button>
                </div>

                <div>
                  {missions.map((mission) => (
                    <MissionRow
                      key={mission.id}
                      mission={mission}
                      onToggle={() =>
                        mission.id !== undefined && toggleMission(mission.id)
                      }
                    />
                  ))}
                </div>

                <div className="border-t border-white/5 bg-white/[0.015] p-4">
                  <button
                    onClick={() =>
                      setNewMissionOpen(true)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 py-3 text-[10px] tracking-widest text-gray-600 transition hover:border-yellow-400/30 hover:text-yellow-400"
                  >
                    <Plus size={15} />
                    ADD OPERATION
                  </button>
                </div>
              </section>

              {/* RIGHT SIDE */}

              <div className="space-y-6">
                {/* BATCOM CORE */}

                <section className="relative overflow-hidden rounded-xl border border-yellow-400/10 bg-[#0a0a0a] p-6">
                  <div className="absolute right-[-70px] top-[-70px] opacity-[0.035]">
                    <BatEmblem size={280} />
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.3em] text-yellow-400">
                          BATCOM CORE
                        </p>

                        <h3 className="mt-2 text-lg font-bold">
                          System Intelligence
                        </h3>
                      </div>

                      <Activity
                        size={18}
                        className="animate-pulse text-green-400"
                      />
                    </div>

                    <div className="mt-7 space-y-6">
                      <ProgressBar
                        label="MISSION COMPLETION"
                        value={`${completionPercentage}%`}
                        percentage={
                          completionPercentage
                        }
                      />

                      <ProgressBar
                        label="PRODUCTIVITY"
                        value="87%"
                        percentage={87}
                      />

                      <ProgressBar
                        label="FOCUS TARGET"
                        value="74%"
                        percentage={74}
                      />

                      <ProgressBar
                        label="WEEKLY OBJECTIVE"
                        value="61%"
                        percentage={61}
                      />
                    </div>
                  </div>
                </section>

                {/* DAILY BRIEFING */}

                <section className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-2 text-yellow-400">
                      <Zap size={17} />
                    </div>

                    <div>
                      <p className="font-mono text-[9px] tracking-[0.25em] text-yellow-400">
                        INTELLIGENCE
                      </p>

                      <h3 className="mt-1 font-bold">
                        Daily Briefing
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <BriefingRow
                      icon={<AlertTriangle size={14} />}
                      text={`${remainingCount} active missions require attention.`}
                    />

                    <BriefingRow
                      icon={<Target size={14} />}
                      text="Critical operations should be completed first."
                    />

                    <BriefingRow
                      icon={<Clock3 size={14} />}
                      text="Recommended focus target: 4 hours."
                    />
                  </div>

                  <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-400/20 bg-yellow-400/5 py-3 text-[9px] font-bold tracking-[0.2em] text-yellow-400 hover:bg-yellow-400/10">
                    <Activity size={14} />
                    RUN DAY ANALYSIS
                  </button>
                </section>

                {/* QUICK SYSTEM */}

                <section className="relative overflow-hidden border border-yellow-400/20 bg-yellow-400/[0.035] p-6">
                  <div className="absolute right-[-20px] top-[-25px] opacity-[0.06]"><BrainCircuit size={150} /></div>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="border border-yellow-400/25 bg-yellow-400/10 p-2 text-yellow-400"><BrainCircuit size={17} /></div>
                      <div><p className="font-mono text-[9px] tracking-[0.25em] text-yellow-400">MISSION INTELLIGENCE</p><h3 className="mt-1 font-bold">Construct an operation</h3></div>
                    </div>
                    <p className="mt-4 max-w-sm text-xs leading-5 text-gray-500">Describe an objective naturally and let BATCOM prepare the mission dossier.</p>
                    <button onClick={openAIGenerator} className="mt-5 flex w-full items-center justify-center gap-2 border border-yellow-400/25 bg-yellow-400/5 py-3 text-[9px] font-bold tracking-[0.2em] text-yellow-400 hover:bg-yellow-400/10"><BrainCircuit size={14} /> GENERATE MISSION WITH AI</button>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <QuickCard
                    icon={<Focus size={18} />}
                    title="FOCUS"
                    subtitle="Enter Chamber"
                    onClick={openFocusChamber}
                  />

                  <QuickCard
                    icon={<BarChart3 size={18} />}
                    title="INTEL"
                    subtitle="View Analytics"
                  />
                </section>
              </div>
            </div>

            {/* =================================================
                BOTTOM SYSTEM BAR
            ================================================= */}

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              <SystemItem
                label="GOTHAM NETWORK"
                value="ONLINE"
              />

              <SystemItem
                label="DATABASE"
                value="LOCAL"
              />

              <SystemItem
                label="SECURITY"
                value="MAXIMUM"
              />
            </div>
          </div>
        </main>
        )}

        {/* ===================================================
            MOBILE NAV
        =================================================== */}

        <div className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-white/10 bg-black/95 px-2 py-2 backdrop-blur-xl lg:hidden">
          <MobileNav
            icon={<LayoutDashboard size={19} />}
            title="Command"
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />

          <MobileNav
            icon={<ListTodo size={19} />}
            title="Missions"
            active={activeView === "missions"}
            onClick={() => setActiveView("missions")}
          />

          <button
            onClick={() =>
              setNewMissionOpen(true)
            }
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-yellow-300/30 bg-yellow-400 text-black shadow-[0_0_25px_rgba(250,204,21,0.25)]"
          >
            <Plus size={21} />
          </button>

          <MobileNav
            icon={<Focus size={19} />}
            title="Focus"
            onClick={openFocusChamber}
          />

          <MobileNav
            icon={<BarChart3 size={19} />}
            title="Intel"
          />
        </div>

        {/* ===================================================
            NEW MISSION MODAL
        =================================================== */}

        <AnimatePresence>
          {newMissionOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                className="w-full max-w-lg overflow-hidden rounded-xl border border-yellow-400/20 bg-[#0c0c0c] shadow-[0_0_80px_rgba(250,204,21,0.08)]"
              >
                <div className="border-b border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[9px] tracking-[0.3em] text-yellow-400">
                        BATCOM // OPERATIONS
                      </p>

                      <h2 className="mt-2 text-xl font-bold">
                        Deploy New Mission
                      </h2>
                    </div>

                    <button
                      onClick={() =>
                        setNewMissionOpen(false)
                      }
                      className="rounded-lg border border-white/10 p-2 text-gray-500 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <label className="font-mono text-[9px] tracking-[0.2em] text-gray-600">
                    MISSION OBJECTIVE
                  </label>

                  <input
                    autoFocus
                    value={missionTitle}
                    onChange={(e) =>
                      setMissionTitle(
                        e.target.value,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addMission();
                      }
                    }}
                    placeholder="Enter mission objective..."
                    className="mt-3 w-full rounded-lg border border-white/10 bg-black px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-yellow-400/50"
                  />

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniOption
                      label="PRIORITY"
                      value="MEDIUM"
                    />

                    <MiniOption
                      label="THREAT"
                      value="NORMAL"
                    />

                    <MiniOption
                      label="ESTIMATE"
                      value="30 MIN"
                    />
                  </div>

                  <button
                    onClick={addMission}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 py-4 text-xs font-black tracking-[0.2em] text-black transition hover:bg-yellow-300"
                  >
                    <Crosshair size={16} />
                    DEPLOY MISSION
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {focusOpen && activeMission && (
            <FocusChamber
              mission={activeMission}
              clock={focusClock}
              seconds={focusSeconds}
              duration={focusDuration}
              running={focusRunning}
              onClose={closeFocusChamber}
              onToggle={() => setFocusRunning((running) => !running)}
              onReset={() => resetFocusTimer()}
              onDurationChange={resetFocusTimer}
              onComplete={() => {
                if (activeMission.id !== undefined) {
                  toggleMission(activeMission.id);
                }
                setFocusRunning(false);
                setFocusOpen(false);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {paletteOpen && (
            <CommandPalette
              onClose={() => setPaletteOpen(false)}
              onCreateMission={() => {
                setPaletteOpen(false);
                setNewMissionOpen(true);
              }}
              onFocus={openFocusChamber}
              onGenerateMission={openAIGenerator}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {aiGeneratorOpen && (
            <AIMissionGenerator
              onClose={() => setAIGeneratorOpen(false)}
              onDeployed={() => {
                void db.missions.toArray().then((records) => setMissions(records.map(fromStoredMission)));
              }}
            />
          )}
        </AnimatePresence>

        {/* mobile bottom spacing */}

        <div className="h-20 lg:hidden" />
      </div>
    </>
  );
}

/* =========================================================
   BRIEFING ROW
========================================================= */

function BriefingRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 text-xs leading-5 text-gray-500">
      <div className="mt-0.5 text-yellow-400">
        {icon}
      </div>

      <span>{text}</span>
    </div>
  );
}

/* =========================================================
   QUICK CARD
========================================================= */

function QuickCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-left transition hover:border-yellow-400/20"
    >
      <div className="text-yellow-400">
        {icon}
      </div>

      <p className="mt-3 text-[10px] font-bold tracking-widest">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-gray-600 group-hover:text-gray-400">
        {subtitle}
      </p>
    </button>
  );
}

/* =========================================================
   SYSTEM ITEM
========================================================= */

function SystemItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0a0a0a] px-4 py-3">
      <span className="font-mono text-[9px] tracking-widest text-gray-600">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

        <span className="font-mono text-[9px] text-green-400">
          {value}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */

function MobileNav({
  icon,
  title,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-1 text-[9px] ${
        active
          ? "text-yellow-400"
          : "text-gray-600"
      }`}
    >
      {icon}

      {title}
    </button>
  );
}

function FocusChamber({
  mission,
  clock,
  seconds,
  duration,
  running,
  onClose,
  onToggle,
  onReset,
  onDurationChange,
  onComplete,
}: {
  mission: Mission;
  clock: string;
  seconds: number;
  duration: number;
  running: boolean;
  onClose: () => void;
  onToggle: () => void;
  onReset: () => void;
  onDurationChange: (minutes: number) => void;
  onComplete: () => void;
}) {
  const progress = Math.max(
    0,
    Math.min(100, ((duration * 60 - seconds) / (duration * 60)) * 100),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#050505]/95 p-5 backdrop-blur-xl"
    >
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(250,204,21,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,.12)_1px,transparent_1px)] [background-size:48px_48px]" />
      <motion.section
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-2xl border border-yellow-400/20 bg-[#0b0b0b] p-6 shadow-[0_0_90px_rgba(250,204,21,.08)] md:p-10"
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-yellow-400">
              BATCOM // FOCUS CHAMBER
            </p>
            <h2 className="mt-2 text-2xl font-black">Deep Work Session</h2>
          </div>
          <button onClick={onClose} aria-label="Close focus chamber" className="rounded-lg border border-white/10 p-2 text-gray-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="py-10 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-gray-600">CURRENT MISSION</p>
          <h3 className="mx-auto mt-3 max-w-xl text-xl font-semibold text-gray-200">{mission.title}</h3>
          <div className="mt-8 font-mono text-7xl font-bold tracking-tight text-yellow-400 md:text-8xl">{clock}</div>
          <div className="mx-auto mt-8 h-1 max-w-md overflow-hidden bg-white/10">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-yellow-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
          {[25, 50, 90].map((minutes) => (
            <button
              key={minutes}
              onClick={() => onDurationChange(minutes)}
              className={`border py-3 font-mono text-[10px] tracking-widest transition ${duration === minutes ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" : "border-white/10 text-gray-600 hover:text-white"}`}
            >
              {minutes} MIN
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onToggle} className="flex flex-1 items-center justify-center gap-2 bg-yellow-400 py-4 text-xs font-black tracking-widest text-black hover:bg-yellow-300">
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "PAUSE SESSION" : "START SESSION"}
          </button>
          <button onClick={onReset} aria-label="Reset focus timer" className="border border-white/10 px-5 text-gray-500 hover:text-yellow-400">
            <RotateCcw size={17} />
          </button>
        </div>
        <button onClick={onComplete} className="mt-3 w-full border border-green-400/20 bg-green-400/5 py-3 text-[10px] font-bold tracking-widest text-green-400 hover:bg-green-400/10">
          COMPLETE MISSION
        </button>
      </motion.section>
    </motion.div>
  );
}

function CommandPalette({
  onClose,
  onCreateMission,
  onFocus,
  onGenerateMission,
}: {
  onClose: () => void;
  onCreateMission: () => void;
  onFocus: () => void;
  onGenerateMission: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-start justify-center bg-black/80 p-4 pt-[14vh] backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-xl overflow-hidden border border-yellow-400/20 bg-[#0c0c0c] shadow-[0_0_70px_rgba(250,204,21,.1)]"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search size={18} className="text-yellow-400" />
          <input autoFocus placeholder="Search BATCOM commands..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600" />
          <kbd className="border border-white/10 px-2 py-1 font-mono text-[9px] text-gray-600">ESC</kbd>
        </div>
        <div className="p-2">
          <PaletteCommand icon={<Plus size={16} />} label="Create new mission" shortcut="N" onClick={onCreateMission} />
          <PaletteCommand icon={<BrainCircuit size={16} />} label="Generate mission with AI" shortcut="AI" onClick={onGenerateMission} />
          <PaletteCommand icon={<Focus size={16} />} label="Start focus chamber" shortcut="F" onClick={onFocus} />
          <PaletteCommand icon={<LayoutDashboard size={16} />} label="Return to command center" shortcut="D" onClick={onClose} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function PaletteCommand({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400">
      {icon}
      <span>{label}</span>
      <kbd className="ml-auto border border-white/10 px-2 py-1 font-mono text-[9px] text-gray-600">{shortcut}</kbd>
    </button>
  );
}

/* =========================================================
   MINI OPTION
========================================================= */

function MiniOption({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <p className="font-mono text-[7px] tracking-widest text-gray-700">
        {label}
      </p>

      <p className="mt-1 text-[9px] text-gray-400">
        {value}
      </p>
    </div>
  );
}

export default App;