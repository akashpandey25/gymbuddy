import axios from "axios";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000`;

const API = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// ── Workout generation ────────────────────────────────────────────────────────
export const generateWorkout = (payload) =>
    API.post("/generate", payload).then(r => r.data);

// ── Exercise swap ─────────────────────────────────────────────────────────────
export const swapExercise = (exercise, equipment) =>
    API.post("/swap", { exercise, equipment }).then(r => r.data);

// ── Workout logging ───────────────────────────────────────────────────────────
export const logWorkout = (payload) =>
    API.post("/log", payload).then(r => r.data);

export const deleteLog = (id, user_id = "default") =>
    API.delete(`/log/${id}`, { params: { user_id } }).then(r => r.data);

// ── History ───────────────────────────────────────────────────────────────────
export const fetchHistory = (user_id = "default", limit = 20) =>
    API.get("/history", { params: { user_id, limit } }).then(r => r.data);

// ── Stats ─────────────────────────────────────────────────────────────────────
export const fetchWeeklyStats = (user_id = "default") =>
    API.get("/stats/weekly", { params: { user_id } }).then(r => r.data);

export const fetchStreak = (user_id = "default") =>
    API.get("/stats/streak", { params: { user_id } }).then(r => r.data);

export const fetchSummary = (user_id = "default") =>
    API.get("/stats/summary", { params: { user_id } }).then(r => r.data);

export default API;
