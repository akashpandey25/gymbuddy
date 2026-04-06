import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import SwapModal from "../components/SwapModal";

export default function WorkoutPlan() {
    const navigate = useNavigate();
    const { plan, target, mode, time, equipment, isLoading } = useWorkoutStore();
    const [swapping, setSwapping] = useState(null); // exercise name being swapped

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-brand-green text-4xl animate-pulse mb-4">🧠</div>
                <p className="text-brand-muted text-sm">Building your plan...</p>
            </div>
        );
    }

    if (!plan || plan.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                <p className="text-2xl mb-2">😕</p>
                <p className="font-semibold mb-1">No workout generated yet</p>
                <p className="text-brand-muted text-sm mb-6">Head back and select your options.</p>
                <button onClick={() => navigate("/")} className="btn-primary">Back to Home</button>
            </div>
        );
    }

    const title = Array.isArray(target)
        ? target.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" + ")
        : target;

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto flex flex-col">
            {/* Header */}
            <button onClick={() => navigate(-1)} className="text-brand-muted text-sm mb-6 hover:text-white transition-colors">
                ← Back
            </button>

            <div className="mb-6">
                <p className="label mb-1">{mode === "combo" ? "Combo Day" : "Single Muscle"}</p>
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="badge">⏱ {time} min</span>
                    <span className="badge">{plan.length} exercises</span>
                </div>
            </div>

            {/* Plan cards */}
            <div className="space-y-3 flex-1">
                {plan.map((ex, idx) => (
                    <div
                        key={`${ex.exercise}-${idx}`}
                        className={`card ${ex.exercise === "Deadlift" ? "border-brand-green/40" : ""}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-brand-muted font-medium">#{idx + 1}</span>
                                    <span className="font-semibold text-sm">{ex.exercise}</span>
                                    {ex.exercise === "Deadlift" && (
                                        <span className="badge-green text-[10px]">Finisher</span>
                                    )}
                                </div>
                                <div className="flex gap-3 text-xs text-brand-muted">
                                    <span>📦 {ex.sets} sets</span>
                                    <span>🔁 {ex.reps} reps</span>
                                    {ex.type && <span className="badge text-[10px]">{ex.type}</span>}
                                </div>
                                {ex.notes && (
                                    <p className="text-brand-green text-xs mt-2 italic">💡 {ex.notes}</p>
                                )}
                            </div>

                            {/* Swap button */}
                            <button
                                onClick={() => setSwapping(ex.exercise)}
                                title="Equipment busy? Swap this exercise"
                                className="btn-ghost text-xs px-3 py-1.5 shrink-0 border-orange-500/30 text-orange-400 hover:border-orange-400"
                            >
                                🔄 Busy
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Log button */}
            <div className="mt-8">
                <button
                    onClick={() => navigate("/log")}
                    className="btn-primary w-full text-center"
                >
                    ✅ Done — Log this Workout
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="btn-ghost w-full text-center mt-3"
                >
                    Start a new workout
                </button>
            </div>

            {/* Swap modal */}
            {swapping && (
                <SwapModal
                    exerciseName={swapping}
                    equipment={equipment}
                    onClose={() => setSwapping(null)}
                />
            )}
        </div>
    );
}
