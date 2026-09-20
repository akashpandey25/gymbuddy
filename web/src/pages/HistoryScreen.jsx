import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHistory, deleteLog } from "../services/api";

const ALL_MUSCLES = ["back", "chest", "legs", "shoulders", "biceps", "triceps"];

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

function getLogTitle(log) {
    const target = Array.isArray(log.target) ? log.target : [log.target];
    return target.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" + ");
}

function parsePlan(plan) {
    if (Array.isArray(plan)) return plan;
    if (typeof plan !== "string") return [];

    try {
        const parsed = JSON.parse(plan);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function SkeletonCard() {
    return (
        <div className="card space-y-3">
            <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-2 rounded-full" />
            <div className="skeleton h-3 w-3/4 rounded" />
        </div>
    );
}

export default function HistoryScreen() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [filterMuscle, setFilterMuscle] = useState("all");

    useEffect(() => {
        loadHistory();
    }, []);

    function loadHistory() {
        setLoading(true);
        fetchHistory("default", 50)
            .then(setLogs)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }

    async function confirmDelete() {
        if (!pendingDelete) return;

        const id = pendingDelete.id;
        setDeletingId(id);
        setDeleteError(null);
        try {
            await deleteLog(id);
            setLogs(prev => prev.filter(l => l.id !== id));
            setPendingDelete(null);
        } catch (err) {
            setDeleteError(err.message || "Failed to delete this workout.");
        } finally {
            setDeletingId(null);
        }
    }

    // Filter logs by muscle
    const filteredLogs = filterMuscle === "all"
        ? logs
        : logs.filter(log => {
            const target = Array.isArray(log.target) ? log.target : [log.target];
            return target.some(t => t.toLowerCase() === filterMuscle);
        });

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto page-enter">
            {/* Header */}
            <p className="label mb-2">Past Sessions</p>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Workout History</h2>
                <span className="badge">{filteredLogs.length} sessions</span>
            </div>

            {/* Filter by muscle */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
                <button
                    onClick={() => setFilterMuscle("all")}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                        ${filterMuscle === "all" ? "bg-brand-green text-black border-brand-green" : "border-brand-border text-brand-muted hover:border-brand-green"}`}
                >
                    All
                </button>
                {ALL_MUSCLES.map(m => (
                    <button
                        key={m}
                        onClick={() => setFilterMuscle(m)}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                            ${filterMuscle === m ? "bg-brand-green text-black border-brand-green" : "border-brand-border text-brand-muted hover:border-brand-green"}`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Loading skeletons */}
            {loading && (
                <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="card border-red-500/30 bg-red-500/5 text-center py-6">
                    <p className="text-red-400 text-sm">{error}</p>
                    <p className="text-brand-muted text-xs mt-1">Make sure the server is running.</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredLogs.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-semibold mb-1">
                        {filterMuscle === "all" ? "No workouts logged yet" : `No ${filterMuscle} workouts yet`}
                    </p>
                    <p className="text-brand-muted text-sm mb-6">Complete a workout and log it to see it here.</p>
                    <button onClick={() => navigate("/")} className="btn-primary">
                        Start a Workout
                    </button>
                </div>
            )}

            {/* Log cards */}
            <div className="space-y-4">
                {filteredLogs.map(log => {
                    const title = getLogTitle(log);
                    const exercises = parsePlan(log.plan);
                    const isExpanded = expandedId === log.id;
                    const isDeleting = deletingId === log.id;

                    return (
                        <div
                            key={log.id}
                            className={`card transition-all duration-200 ${isDeleting ? "opacity-40" : ""}`}
                        >
                            {/* Card header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{title}</p>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        <span className="badge">{log.mode}</span>
                                        <span className="badge">⏱ {log.time_available} min</span>
                                        <span className="badge">{exercises.length} exercises</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="text-brand-muted text-xs">{formatDate(log.created_at)}</p>
                                    <p className="text-brand-muted text-xs">{formatTime(log.created_at)}</p>
                                </div>
                            </div>

                            {/* Collapsed preview */}
                            {!isExpanded && exercises.length > 0 && (
                                <div className="space-y-1 mt-3 pt-3 border-t border-brand-border">
                                    {exercises.slice(0, 3).map((ex, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-brand-muted">
                                            <span className="text-brand-green">•</span>
                                            <span>{ex.exercise}</span>
                                            <span>— {ex.sets}×{ex.reps}</span>
                                        </div>
                                    ))}
                                    {exercises.length > 3 && (
                                        <p className="text-xs text-brand-muted">+{exercises.length - 3} more</p>
                                    )}
                                </div>
                            )}

                            {/* Expanded exercises */}
                            {isExpanded && exercises.length > 0 && (
                                <div className="space-y-2 mt-3 pt-3 border-t border-brand-border">
                                    {exercises.map((ex, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs">
                                            <span className="text-brand-green font-bold w-4">#{i + 1}</span>
                                            <span className="flex-1 font-medium">{ex.exercise}</span>
                                            <span className="text-brand-muted">{ex.sets}×{ex.reps}</span>
                                            {ex.type && <span className="badge text-[10px]">{ex.type}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions row */}
                            <div className="flex gap-2 mt-4 pt-3 border-t border-brand-border">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                    className="btn-ghost text-xs px-4 py-2 flex-1"
                                >
                                    {isExpanded ? "▲ Collapse" : "▼ Show all"}
                                </button>
                                <button
                                    onClick={() => {
                                        setPendingDelete(log);
                                        setDeleteError(null);
                                    }}
                                    disabled={isDeleting}
                                    className="btn-danger px-4 py-2"
                                >
                                    {isDeleting ? "..." : "🗑 Delete"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete confirmation modal */}
            {pendingDelete && (
                <div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-log-title"
                >
                    <div className="card w-full max-w-sm page-enter">
                        <p className="label mb-2">Delete Log</p>
                        <h3 id="delete-log-title" className="text-lg font-bold mb-2">
                            Remove this workout?
                        </h3>
                        <p className="text-brand-muted text-sm leading-relaxed mb-5">
                            {getLogTitle(pendingDelete)} from {formatDate(pendingDelete.created_at)} will be permanently removed from history.
                        </p>

                        {deleteError && (
                            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingDelete(null)}
                                disabled={deletingId === pendingDelete.id}
                                className="btn-ghost flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deletingId === pendingDelete.id}
                                className="btn-danger flex-1 bg-red-500/10 disabled:opacity-50"
                            >
                                {deletingId === pendingDelete.id ? "Deleting..." : "Delete Log"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer so last card isn't hidden by bottom nav */}
            <div className="h-4" />
        </div>
    );
}
