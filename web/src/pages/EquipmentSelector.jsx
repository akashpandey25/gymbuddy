import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWorkoutStore from "../store/workoutStore";

// Icon map for known equipment IDs — enriches dynamically loaded items
const ICONS = {
    "barbell": "🏋️",
    "dumbbell": "💪",
    "cable machine": "🔗",
    "pullup bar": "📊",
    "bodyweight": "🧍",
    "smith machine": "🚀",
    "bench": "🛋️",
    "leg press": "🦵",
    "leg extension": "⬆️",
    "leg curl": "⬇️",
    "kettlebell": "🔔",
    "dip bar": "🤸",
    "pec deck": "🦋",
    "machine": "⚙️",
    "hyperextension bench": "🔄",
};

function toLabel(id) {
    return id
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EquipmentSelector() {
    const navigate = useNavigate();
    const { equipment, toggleEquipment, mode, target, time, setPlan, setLoading, setError } =
        useWorkoutStore();

    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);
    const [equipError, setEquipError] = useState(null);

    // ── Fetch dynamic equipment list for the selected muscle(s) ──
    useEffect(() => {
        const muscle = Array.isArray(target) ? target[0] : target;
        if (!muscle) return;

        setLoadingEquipment(true);
        setEquipError(null);

        fetch(`${API}/generate/equipment-options?muscle=${encodeURIComponent(muscle)}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setAvailableEquipment(
                    (data.equipment || []).map(id => ({
                        id,
                        icon: ICONS[id] || "🏅",
                        label: toLabel(id)
                    }))
                );
            })
            .catch(err => {
                console.warn("Could not load equipment list:", err.message);
                setEquipError("Could not load equipment — showing defaults.");
                // Graceful fallback: static default list
                setAvailableEquipment([
                    { id: "barbell", icon: "🏋️", label: "Barbell" },
                    { id: "dumbbell", icon: "💪", label: "Dumbbell" },
                    { id: "cable machine", icon: "🔗", label: "Cable Machine" },
                    { id: "pullup bar", icon: "📊", label: "Pull-up Bar" },
                    { id: "bodyweight", icon: "🧍", label: "Bodyweight" },
                    { id: "bench", icon: "🛋️", label: "Bench" },
                ]);
            })
            .finally(() => setLoadingEquipment(false));
    }, [target]);

    // ── Generate workout ──────────────────────────────────────────
    async function handleGenerate() {
        const eq = equipment.length === 0 ? ["bodyweight"] : equipment;
        setLoading(true);
        setError(null);
        try {
            const { generateWorkout } = await import("../services/api");
            const plan = await generateWorkout({ mode, target, time, equipment: eq });
            setPlan(plan);
            navigate("/workout");
        } catch (err) {
            setError("Failed to generate workout. Is the server running?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const isSelected = id => equipment.includes(id);

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto flex flex-col">
            <button onClick={() => navigate(-1)} className="text-brand-muted text-sm mb-6 hover:text-white transition-colors">
                ← Back
            </button>
            <p className="label mb-2">Step 3</p>
            <h2 className="text-2xl font-bold mb-2">What equipment is available?</h2>
            <p className="text-brand-muted text-sm mb-6">Only exercises using your selected equipment will be in the plan.</p>

            {/* Loading / error state */}
            {loadingEquipment && (
                <p className="text-brand-muted text-sm text-center mb-4 animate-pulse">Loading equipment…</p>
            )}
            {equipError && (
                <p className="text-yellow-400 text-xs text-center mb-4">{equipError}</p>
            )}

            {/* Dynamic equipment grid */}
            {!loadingEquipment && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {availableEquipment.map(eq => (
                        <button
                            key={eq.id}
                            onClick={() => toggleEquipment(eq.id)}
                            className={`check-card text-center py-4 ${isSelected(eq.id) ? "selected" : ""}`}
                        >
                            <div className="text-2xl mb-1">{eq.icon}</div>
                            <div className={`text-xs font-medium ${isSelected(eq.id) ? "text-brand-green" : "text-white"}`}>
                                {eq.label}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected summary */}
            <p className="text-brand-muted text-xs mb-6 text-center">
                {equipment.length === 0
                    ? "No equipment selected — bodyweight will be used"
                    : `${equipment.length} item${equipment.length > 1 ? "s" : ""} selected`}
            </p>

            <button onClick={handleGenerate} className="btn-primary w-full text-center mt-auto">
                ✨ Generate Workout Plan
            </button>
        </div>
    );
}
