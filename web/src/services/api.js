import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    timeout: 10000,
});

export const generateWorkout = (payload) =>
    API.post("/generate", payload).then(r => r.data);

export const swapExercise = (exercise, equipment) =>
    API.post("/swap", { exercise, equipment }).then(r => r.data);

export const logWorkout = (payload) =>
    API.post("/log", payload).then(r => r.data);

export const fetchHistory = (user_id = "default", limit = 10) =>
    API.get("/history", { params: { user_id, limit } }).then(r => r.data);

export default API;
