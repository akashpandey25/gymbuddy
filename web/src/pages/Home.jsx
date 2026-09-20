import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Flame, CalendarDays, Trophy, Crosshair, Zap, Layers3, ChevronRight } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { fetchStreak, fetchSummary } from "../services/api";

const MODES = [
    {
        id: "single",
        Icon: Crosshair,
        iconBg: "rgba(0,232,122,0.12)",
        iconColor: "#00E87A",
        title: "Single Muscle",
        desc: "Targeted hypertrophy isolating one stubborn muscle group with high mechanical strain.",
        path: "/single",
        tags: ["Chest", "Back", "Legs", "Arms"],
    },
    {
        id: "combo",
        Icon: Zap,
        iconBg: "rgba(251,191,36,0.12)",
        iconColor: "#FBBF24",
        title: "Combo Day",
        desc: "Synergistic antagonist pairs — Back + Biceps, Chest + Triceps engineered for peak output.",
        path: "/combo",
        tags: ["Chest + Triceps", "Back + Biceps", "Shoulders + Core"],
        recommended: true,
    },
    {
        id: "split",
        Icon: Layers3,
        iconBg: "rgba(139,92,246,0.12)",
        iconColor: "#8B5CF6",
        title: "Full Splits & PPL",
        desc: "Architectural macrocycles — Push / Pull / Legs or Full Body for maximum progression.",
        path: "/splits",
        tags: ["PPL", "Upper / Lower", "Full Body"],
    },
];

function QuickStatsSkeleton() {
    return (
        <div className="flex gap-3 mb-10 w-full max-w-md">
            <div className="skeleton h-16 flex-1" />
            <div className="skeleton h-16 flex-1" />
            <div className="skeleton h-16 flex-1" />
        </div>
    );
}

// SVG dumbbell logo mark
function LogoMark() {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="20" width="8" height="8" rx="2" fill="#00E87A" />
            <rect x="36" y="20" width="8" height="8" rx="2" fill="#00E87A" />
            <rect x="10" y="16" width="6" height="16" rx="2" fill="#00E87A" opacity="0.8" />
            <rect x="32" y="16" width="6" height="16" rx="2" fill="#00E87A" opacity="0.8" />
            <rect x="16" y="21" width="16" height="6" rx="3" fill="#00E87A" opacity="0.6" />
        </svg>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const { setMode, resetSession } = useWorkoutStore();
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        Promise.all([fetchStreak(), fetchSummary()])
            .then(([streakData, summaryData]) => {
                setStats({ streak: streakData.streak, ...summaryData });
            })
            .catch(() => setStats(null))
            .finally(() => setLoadingStats(false));
    }, []);

    function handleSelect(m) {
        resetSession();
        setMode(m.id);
        navigate(m.path);
    }

    return (
        <div className="min-h-screen flex flex-col items-center px-4 py-10 page-enter">
            {/* ── Hero Banner ──────────────────────────────── */}
            <div className="w-full max-w-md mb-8 relative overflow-hidden rounded-3xl p-6"
                style={{
                    background: "linear-gradient(135deg, #0f1a14 0%, #0D0D0F 60%, #0a1a10 100%)",
                    border: "1px solid rgba(0,232,122,0.15)",
                }}>
                {/* Ambient glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(0,232,122,0.18) 0%, transparent 70%)" }} />

                {/* Logo row */}
                <div className="flex items-center gap-3 mb-5 float">
                    <LogoMark />
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight leading-none">
                            Gym<span style={{ color: "#00E87A" }}>Buddy</span>
                        </h1>
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: "#00E87A", opacity: 0.7 }}>
                            AI Readiness · Adaptive Engine
                        </p>
                    </div>
                </div>

                <p className="text-white text-lg font-bold leading-snug mb-1">
                    Adaptive workouts for{" "}
                    <span style={{ color: "#00E87A" }}>real gyms.</span>
                </p>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#9ca3af" }}>
                    Limited equipment, limited time — maximum progression synthesised live for today's load.
                </p>

                {/* Stat pills */}
                {loadingStats ? (
                    <QuickStatsSkeleton />
                ) : stats ? (
                    <div className="flex flex-wrap gap-2">
                        <StatPill icon={<Flame size={13} />} value={`${stats.streak} streak`} />
                        <StatPill icon={<CalendarDays size={13} />} value={`${stats.total_this_month ?? 0} this month`} />
                        <StatPill icon={<Trophy size={13} />} value={stats.top_muscle || "No data"} />
                    </div>
                ) : null}
            </div>

            {/* ── Session Architect Label ───────────────── */}
            <div className="w-full max-w-md mb-4 flex items-center justify-between">
                <div>
                    <p className="label">Session Architect</p>
                    <h2 className="text-xl font-bold mt-0.5">Select Workout Mode</h2>
                </div>
                <p className="text-xs" style={{ color: "#6b7280" }}>Customised to your split</p>
            </div>

            {/* ── Mode Cards ───────────────────────────── */}
            <div className="w-full max-w-md space-y-3">
                {MODES.map(m => (
                    <ModeCard key={m.id} mode={m} onSelect={() => handleSelect(m)} />
                ))}
            </div>
        </div>
    );
}

function StatPill({ icon, value }) {
    return (
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
                background: "rgba(0,232,122,0.1)",
                border: "1px solid rgba(0,232,122,0.2)",
                color: "#00E87A",
            }}>
            {icon}
            {value}
        </div>
    );
}

function ModeCard({ mode, onSelect }) {
    const { Icon, iconBg, iconColor, title, desc, tags, recommended } = mode;
    return (
        <button
            onClick={onSelect}
            className="w-full text-left rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden"
            style={{
                background: "#161618",
                border: "1px solid #2A2A2E",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = iconColor;
                e.currentTarget.style.boxShadow = `0 0 24px ${iconColor}22`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#2A2A2E";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {recommended && (
                <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,232,122,0.15)", color: "#00E87A", border: "1px solid rgba(0,232,122,0.3)" }}>
                    Recommended · 45–55 min
                </span>
            )}

            {/* Icon box + title */}
            <div className="flex items-start gap-4 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: iconBg }}>
                    <Icon size={20} color={iconColor} />
                </div>
                <div className="flex-1 pt-0.5">
                    <div className="font-semibold text-base text-white">{title}</div>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: "#9ca3af" }}>{desc}</p>
                </div>
            </div>

            {/* Tags + arrow */}
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => (
                        <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "#1f1f23", color: "#9ca3af", border: "1px solid #2A2A2E" }}>
                            {t}
                        </span>
                    ))}
                </div>
                <ChevronRight size={18} color={iconColor}
                    className="flex-shrink-0 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
        </button>
    );
}
