import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MuscleSelect from "./pages/MuscleSelect";
import ComboSelect from "./pages/ComboSelect";
import SplitsSelect from "./pages/SplitsSelect";
import TimeInput from "./pages/TimeInput";
import EquipmentSelector from "./pages/EquipmentSelector";
import WorkoutPlan from "./pages/WorkoutPlan";
import ActiveWorkout from "./pages/ActiveWorkout";
import LogScreen from "./pages/LogScreen";
import HistoryScreen from "./pages/HistoryScreen";
import StatsScreen from "./pages/StatsScreen";
import "./index.css";

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    {/* ── Main tabs (show bottom nav) ── */}
                    <Route path="/" element={<Home />} />
                    <Route path="/stats" element={<StatsScreen />} />
                    <Route path="/history" element={<HistoryScreen />} />

                    {/* ── Workout wizard (no nav, full-screen flow) ── */}
                    <Route path="/single" element={<MuscleSelect />} />
                    <Route path="/combo" element={<ComboSelect />} />
                    <Route path="/splits" element={<SplitsSelect />} />
                    <Route path="/time" element={<TimeInput />} />
                    <Route path="/equipment" element={<EquipmentSelector />} />
                    <Route path="/workout" element={<WorkoutPlan />} />
                    <Route path="/active" element={<ActiveWorkout />} />
                    <Route path="/log" element={<LogScreen />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
