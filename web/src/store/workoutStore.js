// Zustand store for GymBrain workout session
import { create } from "zustand";

const useWorkoutStore = create((set, get) => ({
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

    // ── Reset session ─────────────────────────────────────────
    resetSession: () => set({
        mode: null, target: [], time: 45, equipment: [], plan: [], error: null
    }),
}));

export default useWorkoutStore;
