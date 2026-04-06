import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MuscleSelect from "./pages/MuscleSelect";
import ComboSelect from "./pages/ComboSelect";
import TimeInput from "./pages/TimeInput";
import EquipmentSelector from "./pages/EquipmentSelector";
import WorkoutPlan from "./pages/WorkoutPlan";
import LogScreen from "./pages/LogScreen";
import HistoryScreen from "./pages/HistoryScreen";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/single" element={<MuscleSelect />} />
        <Route path="/combo" element={<ComboSelect />} />
        <Route path="/time" element={<TimeInput />} />
        <Route path="/equipment" element={<EquipmentSelector />} />
        <Route path="/workout" element={<WorkoutPlan />} />
        <Route path="/log" element={<LogScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
