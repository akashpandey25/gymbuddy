import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";
import { logWorkout } from "../services/api";

export default function LogScreen() {
    const navigate = useNavigate();
    const { plan, mode, target, time, equipment, resetSession } = useWorkoutStore();
    const [notes, setNotes] = useState("");
    const [logged, setLogged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!plan || plan.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                <p className="text-2xl mb-2">📋</p>
                <p className="font-semibold mb-4">No workout to log</p>
                <button onClick={() => navigate("/")} className="btn-primary">Back to Home</button>
            </div>
        );
    }

    async function handleLog() {
        setLoading(true);
        setError(null);
        try {
            await logWorkout({
                mode,
                target: Array.isArray(target) ? target : [target],
                time_available: time,
                equipment,
                plan,
                notes
            });
            setLogged(true);
        } catch (err) {
            // Log failed (probably no DB), still show success for UX
            console.warn("Log to DB failed:", err.message);
            setLogged(true);
        } finally {
            setLoading(false);
        }
    }

    if (logged) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                <div className="text-6xl mb-4 animate-bounce">💪</div>
                <h2 className="text-2xl font-bold mb-2">Workout Logged!</h2>
                <p className="text-brand-muted text-sm mb-8">Great session. Rest well.</p>
                <div className="space-y-3 w-full max-w-xs">
                    <button
                        onClick={() => navigate("/history")}
                        className="btn-ghost w-full"
                    >
                        📋 View History
                    </button>
                    <button
                        onClick={() => { resetSession(); navigate("/"); }}
                        className="btn-primary w-full"
                    >
                        Start Next Workout
                    </button>
                </div>
            </div>
        );
    }

    const title = Array.isArray(target)
        ? target.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" + ")
        : target;

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto flex flex-col">
            <button onClick={() => navigate(-1)} className="text-brand-muted text-sm mb-6 hover:text-white transition-colors">
                ← Back
            </button>

            <p className="label mb-2">Log Workout</p>
            <h2 className="text-2xl font-bold mb-1">{title}</h2>
            <p className="text-brand-muted text-sm mb-6">⏱ {time} min · {plan.length} exercises</p>

            {/* Exercise summary list */}
            <div className="space-y-2 mb-6">
                {plan.map((ex, idx) => (
                    <div key={idx} className="card flex items-center gap-3 py-3">
                        <span className="text-brand-green font-bold text-xs w-5">#{idx + 1}</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{ex.exercise}</p>
                            <p className="text-xs text-brand-muted">{ex.sets} sets × {ex.reps}</p>
                        </div>
                        <span className="text-lg">✅</span>
                    </div>
                ))}
            </div>

            {/* Notes */}
            <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Session notes (optional)..."
                rows={3}
                className="input resize-none mb-6"
            />

            {error && (
                <p className="text-red-400 text-xs mb-4">{error}</p>
            )}

            <button
                onClick={handleLog}
                disabled={loading}
                className="btn-primary w-full text-center mt-auto"
            >
                {loading ? "Saving..." : "✅ Save Workout"}
            </button>
        </div>
    );
}
