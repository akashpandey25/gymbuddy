import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";

const MUSCLES = [
    { id: "back", icon: "🏋️", label: "Back", sub: "Lats, Rhomboids, Deadlift" },
    { id: "chest", icon: "💪", label: "Chest", sub: "Press, Fly, Push" },
    { id: "legs", icon: "🦵", label: "Legs", sub: "Quads, Hams, Glutes, Calves" },
    { id: "shoulders", icon: "🎯", label: "Shoulders", sub: "Delts, Press, Rear Delts" },
    { id: "biceps", icon: "💥", label: "Biceps", sub: "Curl Variations" },
    { id: "triceps", icon: "⚡", label: "Triceps", sub: "Push, Extension, Dip" },
];

export default function MuscleSelect() {
    const navigate = useNavigate();
    const { setTarget, setMode } = useWorkoutStore();

    function handleSelect(m) {
        setMode("single");
        setTarget([m.id]);
        navigate("/time");
    }

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto">
            {/* Header */}
            <button onClick={() => navigate("/")} className="text-brand-muted text-sm mb-6 hover:text-white transition-colors">
                ← Back
            </button>
            <p className="label mb-2">Single Muscle</p>
            <h2 className="text-2xl font-bold mb-6">Which muscle today?</h2>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3">
                {MUSCLES.map(m => (
                    <button
                        key={m.id}
                        onClick={() => handleSelect(m)}
                        className="card text-left hover:border-brand-green hover:glow-green active:scale-95 transition-all duration-150 group"
                    >
                        <div className="text-3xl mb-3">{m.icon}</div>
                        <div className="font-semibold text-sm">{m.label}</div>
                        <div className="text-brand-muted text-xs mt-1 leading-snug">{m.sub}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
