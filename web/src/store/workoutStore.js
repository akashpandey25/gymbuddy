// Zustand store for GymBrain workout session
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWorkoutStore = create(persist((set, get) => ({
    // ── Session state ─────────────────────────────────────────
    mode: null,          // "single" | "combo" | "split"
    target: [],          // e.g. ["back","biceps"]
    time: 45,            // minutes
    equipment: [],       // selected equipment list
    plan: [],            // generated workout plan
    isLoading: false,
    error: null,

    // ── History ───────────────────────────────────────────────
    history: [],

    // ── Active Workout State ──────────────────────────────────
    // Tracks progress during an active workout session
    completedSets: {},   // { [exerciseName]: number of completed sets }
    restTimerActive: false,
    restSeconds: 0,
    restTimerMax: 60,    // configurable rest duration
    restTimerEndsAt: null,
    restCompletedAt: null,

    // ── Setters ───────────────────────────────────────────────
    setMode: (mode) => set({ mode, target: [], plan: [] }),
    setTarget: (target) => set({ target: Array.isArray(target) ? target : [target] }),
    setTime: (time) => set({ time }),
    toggleEquipment: (item) => set((state) => {
        const eq = state.equipment.includes(item)
            ? state.equipment.filter(e => e !== item)
            : [...state.equipment, item];
        return { equipment: eq };
    }),
    setEquipment: (equipment) => set({ equipment }),
    setPlan: (plan) => set({ plan }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setHistory: (history) => set({ history }),

    // ── Swap a single exercise in the plan ────────────────────
    swapExercise: (originalName, newExercise) => set((state) => ({
        plan: state.plan.map(ex =>
            ex.exercise === originalName ? { ...ex, ...newExercise } : ex
        )
    })),

    // ── Active Workout Actions ────────────────────────────────
    completeSet: (exerciseName) => set((state) => {
        const current = state.completedSets[exerciseName] || 0;
        const exercise = state.plan.find(e => e.exercise === exerciseName);
        const maxSets = exercise ? parseInt(exercise.sets, 10) : 99;
        if (current >= maxSets) return {}; // already done
        return {
            completedSets: { ...state.completedSets, [exerciseName]: current + 1 }
        };
    }),

    uncompleteSet: (exerciseName) => set((state) => {
        const current = state.completedSets[exerciseName] || 0;
        if (current <= 0) return {};
        return {
            completedSets: { ...state.completedSets, [exerciseName]: current - 1 }
        };
    }),

    startRestTimer: (seconds) => {
        const duration = seconds || get().restTimerMax;
        set({
            restTimerActive: true,
            restSeconds: duration,
            restTimerEndsAt: Date.now() + duration * 1000,
            restCompletedAt: null
        });
    },
    tickRestTimer: () => set((state) => {
        if (!state.restTimerActive || !state.restTimerEndsAt) return {};
        const next = Math.max(0, Math.ceil((state.restTimerEndsAt - Date.now()) / 1000));
        if (next <= 0) {
            return {
                restTimerActive: false,
                restSeconds: 0,
                restTimerEndsAt: null,
                restCompletedAt: Date.now()
            };
        }
        return { restSeconds: next };
    }),
    stopRestTimer: () => set({ restTimerActive: false, restSeconds: 0, restTimerEndsAt: null }),
    setRestTimerMax: (seconds) => set({ restTimerMax: seconds }),

    resetActiveWorkout: () => set({
        completedSets: {},
        restTimerActive: false,
        restSeconds: 0,
        restTimerEndsAt: null,
        restCompletedAt: null
    }),

    // ── Reset session ─────────────────────────────────────────
    resetSession: () => set({
        mode: null, target: [], time: 45, equipment: [], plan: [], error: null,
        completedSets: {}, restTimerActive: false, restSeconds: 0,
        restTimerEndsAt: null, restCompletedAt: null
    }),
}), {
    name: "gymbrain-workout",
    partialize: (state) => ({
        mode: state.mode,
        target: state.target,
        time: state.time,
        equipment: state.equipment,
        plan: state.plan,
        completedSets: state.completedSets,
        restTimerActive: state.restTimerActive,
        restSeconds: state.restSeconds,
        restTimerMax: state.restTimerMax,
        restTimerEndsAt: state.restTimerEndsAt,
    }),
}));

export default useWorkoutStore;
