import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";

// Rest durations in seconds
const REST_PRESETS = [30, 60, 90, 120];

function RestTimer({ seconds, max, onSkip }) {
    const pct = max > 0 ? ((max - seconds) / max) * 100 : 100;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = mins > 0
        ? `${mins}:${String(secs).padStart(2, "0")}`
        : `${seconds}s`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: "rgba(10,10,12,0.92)", backdropFilter: "blur(12px)" }}
        >
            <div className="card w-full max-w-xs text-center py-8 glow-pulse">
                <p className="label mb-3">Rest Timer</p>

                {/* Circular progress ring */}
                <div className="relative inline-flex items-center justify-center mb-6">
                    <svg width="120" height="120" className="rotate-[-90deg]">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#1e1e22" strokeWidth="8" />
                        <circle
                            cx="60" cy="60" r="50"
                            fill="none"
                            stroke="#00E87A"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                            style={{ transition: "stroke-dashoffset 0.9s linear" }}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-brand-green">{timeStr}</span>
                        <span className="text-[10px] text-brand-muted">remaining</span>
                    </div>
                </div>

                <p className="text-brand-muted text-sm mb-6">
                    Recover before your next set 💪
                </p>

                <button onClick={onSkip} className="btn-ghost w-full">
                    Skip Rest →
                </button>
            </div>
        </div>
    );
}

export default function ActiveWorkout() {
    const navigate = useNavigate();
    const {
        plan, target, mode, time,
        completedSets, completeSet, uncompleteSet,
        restTimerActive, restSeconds, restTimerMax,
        restCompletedAt,
        startRestTimer, tickRestTimer, stopRestTimer, setRestTimerMax,
    } = useWorkoutStore();

    const [currentExIdx, setCurrentExIdx] = useState(0);
    const intervalRef = useRef(null);
    const wakeLockRef = useRef(null);

    // Play a short "ding" when rest finishes
    const playDing = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch { /* audio context may not be available */ }
    }, []);

    // Rest timer countdown
    useEffect(() => {
        if (restTimerActive) {
            tickRestTimer();
            intervalRef.current = setInterval(() => {
                tickRestTimer();
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [restTimerActive, tickRestTimer]);

    // Wake lock keeps the active workout usable on phones when supported.
    useEffect(() => {
        let released = false;

        async function requestWakeLock() {
            if (!("wakeLock" in navigator) || released || wakeLockRef.current) return;
            try {
                wakeLockRef.current = await navigator.wakeLock.request("screen");
                wakeLockRef.current.addEventListener("release", () => {
                    wakeLockRef.current = null;
                });
            } catch {
                // Some browsers only allow this over HTTPS or after a user gesture.
            }
        }

        function handleVisibilityChange() {
            tickRestTimer();
            if (document.visibilityState === "visible") requestWakeLock();
        }

        requestWakeLock();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            released = true;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => {});
                wakeLockRef.current = null;
            }
        };
    }, [tickRestTimer]);

    // Play the finish sound only when the timer naturally completes, not on skip.
    useEffect(() => {
        if (restCompletedAt) playDing();
    }, [restCompletedAt, playDing]);

    if (!plan || plan.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                <p className="text-2xl mb-2">😕</p>
                <p className="font-semibold mb-1">No workout to run</p>
                <p className="text-brand-muted text-sm mb-6">Generate a workout plan first.</p>
                <button onClick={() => navigate("/")} className="btn-primary">Back to Home</button>
            </div>
        );
    }

    // Total sets across all exercises
    const totalSets = plan.reduce((acc, ex) => acc + parseInt(ex.sets, 10), 0);
    const doneSets = Object.values(completedSets).reduce((a, b) => a + b, 0);
    const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
    const isAllDone = progressPct === 100;

    const currentEx = plan[currentExIdx];
    const currentDone = completedSets[currentEx?.exercise] || 0;
    const currentMax = currentEx ? parseInt(currentEx.sets, 10) : 0;
    const currentComplete = currentDone >= currentMax;

    function handleSetComplete() {
        if (currentDone < currentMax) {
            completeSet(currentEx.exercise);
            // Auto-start rest timer (only if not last set of last exercise)
            const isLastSet = currentDone + 1 >= currentMax;
            const isLastEx = currentExIdx === plan.length - 1;
            if (!(isLastSet && isLastEx)) {
                startRestTimer(restTimerMax);
                // Auto-advance to next exercise when all sets of current are done
                if (isLastSet && currentExIdx < plan.length - 1) {
                    setCurrentExIdx(i => i + 1);
                }
            }
        }
    }

    function handleSetUndo() {
        uncompleteSet(currentEx.exercise);
    }

    const title = Array.isArray(target)
        ? target.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" + ")
        : target;

    return (
        <div className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto page-enter">
            {/* Top progress bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => navigate(-1)} className="text-brand-muted text-sm hover:text-white transition-colors">
                        ← Exit
                    </button>
                    <span className="text-xs text-brand-muted">{doneSets}/{totalSets} sets · {progressPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-brand-border rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-green rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Workout info */}
            <div className="mb-6">
                <p className="label mb-0.5">{mode === "combo" ? "Combo Day" : "Active Workout"}</p>
                <h2 className="text-xl font-bold">{title}</h2>
                <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="badge">⏱ {time} min</span>
                    <span className="badge">{plan.length} exercises</span>
                </div>
            </div>

            {/* Exercise tabs (scrollable) */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 -mx-4 px-4">
                {plan.map((ex, idx) => {
                    const done = (completedSets[ex.exercise] || 0) >= parseInt(ex.sets, 10);
                    const active = idx === currentExIdx;
                    return (
                        <button
                            key={idx}
                            onClick={() => setCurrentExIdx(idx)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                ${active ? "bg-brand-green text-black border-brand-green" :
                                    done ? "border-brand-green/40 text-brand-green bg-brand-green/10" :
                                        "border-brand-border text-brand-muted"}`}
                        >
                            {done ? "✓ " : ""}{ex.exercise}
                        </button>
                    );
                })}
            </div>

            {/* Current exercise card */}
            {currentEx && (
                <div className="card flex-1 mb-5" style={currentComplete ? { borderColor: "rgba(0,232,122,0.4)" } : {}}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="text-xs text-brand-muted font-medium">
                                Exercise {currentExIdx + 1} of {plan.length}
                            </span>
                            <h3 className="text-lg font-bold mt-0.5">{currentEx.exercise}</h3>
                        </div>
                        {currentComplete && (
                            <span className="badge-green text-sm">✓ Done</span>
                        )}
                    </div>

                    {/* Sets × Reps info */}
                    <div className="flex gap-4 mb-6">
                        <div className="stat-card flex-1 items-center text-center">
                            <span className="text-2xl font-extrabold text-brand-green">{currentEx.sets}</span>
                            <span className="text-xs text-brand-muted">Sets</span>
                        </div>
                        <div className="stat-card flex-1 items-center text-center">
                            <span className="text-2xl font-extrabold">{currentEx.reps}</span>
                            <span className="text-xs text-brand-muted">Reps</span>
                        </div>
                        {currentEx.type && (
                            <div className="stat-card flex-1 items-center text-center">
                                <span className="text-xs font-semibold text-brand-green">{currentEx.type}</span>
                                <span className="text-xs text-brand-muted">Type</span>
                            </div>
                        )}
                    </div>

                    {currentEx.notes && (
                        <p className="text-brand-green text-xs italic mb-4">💡 {currentEx.notes}</p>
                    )}

                    {/* Set completion dots */}
                    <div className="flex gap-2 mb-5">
                        {Array.from({ length: currentMax }).map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-3 rounded-full transition-all duration-300 ${i < currentDone ? "bg-brand-green" : "bg-brand-border"}`}
                            />
                        ))}
                    </div>

                    {/* Set actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSetUndo}
                            disabled={currentDone === 0}
                            className="btn-ghost px-4 py-3 text-sm disabled:opacity-30"
                        >
                            ↩ Undo
                        </button>
                        <button
                            onClick={handleSetComplete}
                            disabled={currentComplete}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentComplete ? "✓ All Sets Done!" : `Set ${currentDone + 1} Done ✓`}
                        </button>
                    </div>
                </div>
            )}

            {/* Rest timer duration selector */}
            <div className="card mb-5">
                <p className="text-xs text-brand-muted mb-2 uppercase tracking-wider">Rest Duration</p>
                <div className="flex gap-2">
                    {REST_PRESETS.map(s => (
                        <button
                            key={s}
                            onClick={() => setRestTimerMax(s)}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all
                                ${restTimerMax === s ? "bg-brand-green text-black border-brand-green" : "border-brand-border text-white hover:border-brand-green"}`}
                        >
                            {s >= 60 ? `${s / 60}m` : `${s}s`}
                        </button>
                    ))}
                </div>
            </div>

            {/* All exercises overview */}
            <div className="space-y-2 mb-6">
                <p className="text-xs text-brand-muted uppercase tracking-wider mb-3">All Exercises</p>
                {plan.map((ex, idx) => {
                    const done = completedSets[ex.exercise] || 0;
                    const total = parseInt(ex.sets, 10);
                    const complete = done >= total;
                    return (
                        <button
                            key={idx}
                            onClick={() => setCurrentExIdx(idx)}
                            className={`w-full card py-3 flex items-center gap-3 text-left transition-all ${idx === currentExIdx ? "border-brand-green/50" : ""}`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${complete ? "bg-brand-green text-black" : "bg-brand-border text-brand-muted"}`}>
                                {complete ? "✓" : idx + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{ex.exercise}</p>
                                <p className="text-xs text-brand-muted">{done}/{total} sets</p>
                            </div>
                            {!complete && (
                                <div className="w-16 h-1.5 bg-brand-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-green rounded-full"
                                        style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                                    />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Finish button */}
            <button
                onClick={() => navigate("/log")}
                className={isAllDone ? "btn-primary w-full text-center" : "btn-ghost w-full text-center"}
            >
                {isAllDone ? "🎉 Workout Complete — Log It!" : "⏭ Finish Early & Log"}
            </button>

            {/* Rest Timer Overlay */}
            {restTimerActive && (
                <RestTimer
                    seconds={restSeconds}
                    max={restTimerMax}
                    onSkip={stopRestTimer}
                />
            )}
        </div>
    );
}
