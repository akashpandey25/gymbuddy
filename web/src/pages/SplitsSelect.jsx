import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowUpFromLine, ArrowDownToLine, Footprints } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const SPLITS = [
    {
        id: "push",
        targets: ["chest", "shoulders", "triceps"],
        Icon: ArrowUpFromLine,
        color: "#F97316",
        bg: "rgba(249,115,22,0.1)",
        label: "Push Day",
        sub: "Chest · Shoulders · Triceps",
    },
    {
        id: "pull",
        targets: ["back", "biceps"],
        Icon: ArrowDownToLine,
        color: "#00E87A",
        bg: "rgba(0,232,122,0.1)",
        label: "Pull Day",
        sub: "Back · Biceps — Deadlift finisher",
        highlight: true,
        badge: "Pull Classic",
    },
    {
        id: "legs",
        targets: ["legs", "shoulders"],
        Icon: Footprints,
        color: "#A78BFA",
        bg: "rgba(167,139,250,0.1)",
        label: "Leg Day",
        sub: "Quads · Hams · Glutes + Shoulders",
    },
    {
        id: "fullbody",
        targets: ["chest", "back", "legs", "shoulders"],
        png: "/fullBody.png",
        color: "#FBBF24",
        bg: "rgba(251,191,36,0.1)",
        label: "Full Body",
        sub: "Compound movements across all groups",
    },
];

export default function SplitsSelect() {
    const navigate = useNavigate();
    const { setTarget, setMode } = useWorkoutStore();

    function handleSelect(s) {
        setMode("combo");
        setTarget(s.targets);
        navigate("/time");
    }

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto page-enter">
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
                style={{ color: "#6b7280" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
            >
                <ChevronLeft size={16} />
                Back
            </button>
            <p className="label mb-2">Splits</p>
            <h2 className="text-2xl font-bold mb-2">Choose your split</h2>
            <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
                Push / Pull / Legs or Full Body — GymBuddy builds the plan.
            </p>

            <div className="space-y-3">
                {SPLITS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => handleSelect(s)}
                        className="w-full text-left rounded-2xl p-5 transition-all duration-200 group relative"
                        style={{ background: "#161618", border: "1px solid #2A2A2E" }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = s.color;
                            e.currentTarget.style.boxShadow = `0 0 24px ${s.color}22`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#2A2A2E";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        {s.highlight && (
                            <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(0,232,122,0.12)", color: "#00E87A", border: "1px solid rgba(0,232,122,0.25)" }}>
                                {s.badge}
                            </span>
                        )}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: s.bg }}>
                                {s.png
                                    ? <img src={s.png} alt={s.label} style={{ width: 22, height: 22, objectFit: "contain" }} />
                                    : <s.Icon size={20} color={s.color} />
                                }
                            </div>
                            <div className="flex-1 pt-0.5">
                                <div className="font-semibold text-base text-white">{s.label}</div>
                                <p className="text-sm mt-1" style={{ color: s.color, opacity: 0.85 }}>{s.sub}</p>
                            </div>
                            <ChevronRight size={18} color={s.color}
                                className="self-center flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
