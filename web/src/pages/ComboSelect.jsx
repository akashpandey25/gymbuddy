import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";

const COMBOS = [
    {
        id: "back+biceps",
        targets: ["back", "biceps"],
        icon: "🏋️",
        label: "Back + Biceps",
        sub: "Pull day classic — deadlift finisher included",
        highlight: true,
    },
    {
        id: "chest+triceps",
        targets: ["chest", "triceps"],
        icon: "💪",
        label: "Chest + Triceps",
        sub: "Push day — press and extend",
    },
    {
        id: "legs+shoulders",
        targets: ["legs", "shoulders"],
        icon: "🦵",
        label: "Legs + Shoulders",
        sub: "Full lower + upper press",
    },
];

export default function ComboSelect() {
    const navigate = useNavigate();
    const { setTarget, setMode } = useWorkoutStore();

    function handleSelect(c) {
        setMode("combo");
        setTarget(c.targets);
        navigate("/time");
    }

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto">
            <button onClick={() => navigate("/")} className="text-brand-muted text-sm mb-6 hover:text-white transition-colors">
                ← Back
            </button>
            <p className="label mb-2">Combo Day</p>
            <h2 className="text-2xl font-bold mb-6">Choose your pairing</h2>

            <div className="space-y-4">
                {COMBOS.map(c => (
                    <button
                        key={c.id}
                        onClick={() => handleSelect(c)}
                        className="w-full text-left card hover:border-brand-green hover:glow-green active:scale-98 transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-3xl">{c.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{c.label}</span>
                                    {c.highlight && <span className="badge-green">Founder's pick</span>}
                                </div>
                                <p className="text-brand-muted text-sm mt-1">{c.sub}</p>
                            </div>
                            <span className="text-brand-green text-xl self-center group-hover:translate-x-1 transition-transform">
                                →
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
