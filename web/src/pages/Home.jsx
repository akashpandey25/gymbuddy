import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";

const MODES = [
    {
        id: "single",
        icon: "🎯",
        title: "Single Muscle",
        desc: "Focus on one muscle group — back, chest, legs, shoulders, biceps or triceps.",
        path: "/single",
    },
    {
        id: "combo",
        icon: "⚡",
        title: "Combo Day",
        desc: "Classic pairings — Back + Biceps, Chest + Triceps, or Legs + Shoulders.",
        path: "/combo",
    },
    {
        id: "split",
        icon: "🔥",
        title: "Splits",
        desc: "Push / Pull / Legs or Full Body — coming in Phase 2.",
        path: "/single",
        disabled: true,
    },
];

export default function Home() {
    const navigate = useNavigate();
    const { setMode, resetSession } = useWorkoutStore();

    function handleSelect(m) {
        if (m.disabled) return;
        resetSession();
        setMode(m.id);
        navigate(m.path);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Logo / Brand */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                    <span className="text-4xl">🧠</span>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Gym<span className="text-brand-green">Brain</span>
                    </h1>
                </div>
                <p className="text-brand-muted text-sm max-w-xs mx-auto">
                    Adaptive workouts for real gyms — limited equipment, limited time, maximum results.
                </p>
            </div>

            {/* Mode Cards */}
            <div className="w-full max-w-md space-y-4">
                {MODES.map(m => (
                    <button
                        key={m.id}
                        onClick={() => handleSelect(m)}
                        disabled={m.disabled}
                        className={`w-full text-left card transition-all duration-200 group
              ${m.disabled
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:border-brand-green hover:glow-green cursor-pointer active:scale-98"
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-3xl mt-0.5">{m.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">{m.title}</span>
                                    {m.disabled && (
                                        <span className="badge text-[10px]">Phase 2</span>
                                    )}
                                </div>
                                <p className="text-brand-muted text-sm mt-1 leading-relaxed">{m.desc}</p>
                            </div>
                            {!m.disabled && (
                                <span className="text-brand-green text-xl self-center group-hover:translate-x-1 transition-transform">
                                    →
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* History link */}
            <button
                onClick={() => navigate("/history")}
                className="mt-10 text-brand-muted text-sm hover:text-brand-green transition-colors"
            >
                📋 View workout history
            </button>
        </div>
    );
}
