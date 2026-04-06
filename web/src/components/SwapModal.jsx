import { useState } from "react";
import useWorkoutStore from "../store/workoutStore";
import { swapExercise as swapAPI } from "../services/api";

export default function SwapModal({ exerciseName, equipment, onClose }) {
    const swapExercise = useWorkoutStore(s => s.swapExercise);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function handleFindSwap() {
        setLoading(true);
        setError(null);
        try {
            const data = await swapAPI(exerciseName, equipment);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || "No swap found for available equipment.");
        } finally {
            setLoading(false);
        }
    }

    function handleConfirm() {
        if (!result) return;
        swapExercise(exerciseName, {
            exercise: result.alternative,
            sets: result.sets,
            reps: result.reps,
        });
        onClose();
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50
                      bg-brand-card border border-brand-border rounded-t-3xl px-6 py-8
                      animate-in slide-in-from-bottom duration-300">
                {/* Handle */}
                <div className="w-10 h-1 bg-brand-border rounded-full mx-auto mb-6" />

                <p className="label mb-2">Equipment Busy</p>
                <h3 className="text-lg font-bold mb-1">Swap: {exerciseName}</h3>
                <p className="text-brand-muted text-sm mb-6">
                    Find the closest movement using your available equipment.
                </p>

                {/* Result */}
                {result && (
                    <div className="card border-brand-green/40 bg-brand-green/5 mb-5">
                        <p className="text-xs text-brand-muted mb-1">Suggested swap</p>
                        <p className="font-bold text-lg text-brand-green">{result.alternative}</p>
                        <div className="flex gap-3 text-xs text-brand-muted mt-1">
                            <span>📦 {result.sets} sets</span>
                            <span>🔁 {result.reps} reps</span>
                        </div>
                        {result.reason && (
                            <p className="text-brand-muted text-xs mt-2 italic">{result.reason}</p>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="card border-red-500/30 bg-red-500/5 mb-5">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    {!result ? (
                        <button
                            onClick={handleFindSwap}
                            disabled={loading}
                            className="btn-primary w-full text-center"
                        >
                            {loading ? "Finding swap..." : "🔍 Find Swap"}
                        </button>
                    ) : (
                        <button onClick={handleConfirm} className="btn-primary w-full text-center">
                            ✅ Use {result.alternative}
                        </button>
                    )}
                    <button onClick={onClose} className="btn-ghost w-full text-center">
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
}
