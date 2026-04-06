import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHistory } from "../services/api";

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit"
    });
}

export default function HistoryScreen() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory()
            .then(setLogs)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto">
            <button onClick={() => navigate("/")} className="text-brand-muted text-sm mb-6 hover:text-white transition-colors">
                ← Back
            </button>
            <p className="label mb-2">Past Sessions</p>
            <h2 className="text-2xl font-bold mb-6">Workout History</h2>

            {loading && (
                <div className="flex justify-center py-20">
                    <span className="text-brand-green text-4xl animate-pulse">🧠</span>
                </div>
            )}

            {error && (
                <div className="card border-red-500/30 bg-red-500/5 text-center py-6">
                    <p className="text-red-400 text-sm">{error}</p>
                    <p className="text-brand-muted text-xs mt-1">Make sure the server is running.</p>
                </div>
            )}

            {!loading && !error && logs.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-semibold mb-1">No workouts logged yet</p>
                    <p className="text-brand-muted text-sm mb-6">Complete a workout and log it to see it here.</p>
                    <button onClick={() => navigate("/")} className="btn-primary">
                        Start a Workout
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {logs.map(log => {
                    const target = Array.isArray(log.target) ? log.target : [log.target];
                    const title = target.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" + ");
                    const exercises = Array.isArray(log.plan)
                        ? log.plan
                        : (typeof log.plan === "string" ? JSON.parse(log.plan) : []);

                    return (
                        <div key={log.id} className="card">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-sm">{title}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="badge">{log.mode}</span>
                                        <span className="badge">⏱ {log.time_available} min</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-brand-muted text-xs">{formatDate(log.created_at)}</p>
                                    <p className="text-brand-muted text-xs">{formatTime(log.created_at)}</p>
                                </div>
                            </div>

                            {exercises.length > 0 && (
                                <div className="border-t border-brand-border mt-3 pt-3 space-y-1">
                                    {exercises.slice(0, 4).map((ex, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-brand-muted">
                                            <span className="text-brand-green">•</span>
                                            <span>{ex.exercise}</span>
                                            <span>— {ex.sets}×{ex.reps}</span>
                                        </div>
                                    ))}
                                    {exercises.length > 4 && (
                                        <p className="text-xs text-brand-muted">+{exercises.length - 4} more</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
