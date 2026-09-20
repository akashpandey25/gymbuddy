import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, Check, PersonStanding, Weight, Move, Repeat, Swords, Grip, Computer, ChevronDown, Layers } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { API_BASE_URL, generateWorkout } from "../services/api";

// Each entry has either `png` (from /public) or a lucide `Icon`.
// PNGs are shown as-is (they have their own colours).
// lucide Icons are tinted with `color`.
const EQUIPMENT_META = {
    "barbell": { label: "Barbell", png: "/barbell.png", color: "#00E87A", bg: "rgba(0,232,122,0.1)" },
    "dumbbell": { label: "Dumbbells", png: "/dumble.png", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
    "cable machine": { label: "Cable Machine", png: "/cableMachine.png", color: "#38BDF8", bg: "rgba(56,189,248,0.1)" },
    "pullup bar": { label: "Pull-up Bar", png: "/pullup.png", color: "#A78BFA", bg: "rgba(167,139,250,0.1)" },
    "smith machine": { label: "Smith Machine", png: "/smithMachine.png", color: "#FB7185", bg: "rgba(251,113,133,0.1)" },
    "bench": { label: "Bench", png: "/bench.png", color: "#34D399", bg: "rgba(52,211,153,0.1)" },
    "bodyweight": { label: "Bodyweight", Icon: PersonStanding, color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
    "leg press": { label: "Leg Press", Icon: Move, color: "#818CF8", bg: "rgba(129,140,248,0.1)" },
    "leg extension": { label: "Leg Extension", Icon: Repeat, color: "#F472B6", bg: "rgba(244,114,182,0.1)" },
    "leg curl": { label: "Leg Curl", Icon: ChevronDown, color: "#FCD34D", bg: "rgba(252,211,77,0.1)" },
    "kettlebell": { label: "Kettlebells", Icon: Weight, color: "#6EE7B7", bg: "rgba(110,231,183,0.1)" },
    "dip bar": { label: "Dip Bar", Icon: Swords, color: "#93C5FD", bg: "rgba(147,197,253,0.1)" },
    "pec deck": { label: "Pec Deck", Icon: "/pecDeck.png", color: "#FCA5A5", bg: "rgba(252,165,165,0.1)" },
    "machine": { label: "Machine", Icon: Computer, color: "#C4B5FD", bg: "rgba(196,181,253,0.1)" },
    "hyperextension bench": { label: "Hyperext. Bench", Icon: Layers, color: "#86EFAC", bg: "rgba(134,239,172,0.1)" },
};

const DEFAULT_EQUIPMENT_IDS = Object.keys(EQUIPMENT_META);

function toLabel(id) {
    return id
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

function toEquipmentOption(id) {
    const meta = EQUIPMENT_META[id];
    const fallback = EQUIPMENT_META["machine"];
    return {
        id,
        label: meta?.label || toLabel(id),
        png: meta?.png || null,
        Icon: meta?.Icon || fallback.Icon,
        color: meta?.color || fallback.color,
        bg: meta?.bg || fallback.bg,
    };
}

// Renders either a PNG image or a lucide icon inside the icon box
function EquipIcon({ eq, size = 22 }) {
    if (eq.png) {
        return (
            <img
                src={eq.png}
                alt={eq.label}
                style={{ width: size, height: size, objectFit: "contain" }}
            />
        );
    }
    return <eq.Icon size={size} color={eq.color} />;
}

export default function EquipmentSelector() {
    const navigate = useNavigate();
    const { equipment, toggleEquipment, mode, target, time, setPlan, setLoading, setError } =
        useWorkoutStore();

    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);
    const [equipError, setEquipError] = useState(null);

    // ── Fetch dynamic equipment list for the selected muscle(s) ──
    useEffect(() => {
        const muscles = (Array.isArray(target) ? target : [target]).filter(Boolean);
        if (muscles.length === 0) return;

        setLoadingEquipment(true);
        setEquipError(null);

        Promise.all(
            muscles.map(muscle =>
                fetch(`${API_BASE_URL}/generate/equipment-options?muscle=${encodeURIComponent(muscle)}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data.error) throw new Error(data.error);
                        return data.equipment || [];
                    })
            )
        )
            .then(results => {
                const ids = [...new Set(results.flat())].sort();
                setAvailableEquipment(ids.map(toEquipmentOption));
            })
            .catch(err => {
                console.warn("Could not load equipment list:", err.message);
                setEquipError("Could not load equipment — showing defaults.");
                setAvailableEquipment(DEFAULT_EQUIPMENT_IDS.map(toEquipmentOption));
            })
            .finally(() => setLoadingEquipment(false));
    }, [target]);

    // ── Generate workout ──────────────────────────────────────────
    async function handleGenerate() {
        const eq = equipment.length === 0 ? ["bodyweight"] : equipment;
        setLoading(true);
        setError(null);
        try {
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
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto flex flex-col page-enter">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
                style={{ color: "#6b7280" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
            >
                <ChevronLeft size={16} />
                Back
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

            {/* Dynamic equipment list — horizontal cards */}
            {!loadingEquipment && (
                <div className="flex flex-col gap-2 mb-4">
                    {availableEquipment.map(eq => {
                        const selected = isSelected(eq.id);
                        return (
                            <button
                                key={eq.id}
                                onClick={() => toggleEquipment(eq.id)}
                                className="flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-150 text-left"
                                style={{
                                    background: selected ? `${eq.color}0f` : "#161618",
                                    border: `1px solid ${selected ? eq.color : "#2A2A2E"}`,
                                    boxShadow: selected ? `0 0 16px ${eq.color}20` : "none",
                                }}
                            >
                                {/* Icon box */}
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: eq.bg }}
                                >
                                    <EquipIcon eq={eq} size={22} />
                                </div>

                                {/* Label */}
                                <span
                                    className="flex-1 text-sm font-semibold"
                                    style={{ color: selected ? eq.color : "#fff" }}
                                >
                                    {eq.label}
                                </span>

                                {/* Checkmark */}
                                <div
                                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150"
                                    style={{
                                        background: selected ? eq.color : "#2A2A2E",
                                        border: `1px solid ${selected ? eq.color : "#3f3f45"}`,
                                    }}
                                >
                                    {selected && <Check size={13} color="#000" strokeWidth={3} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Selected summary */}
            <p className="text-brand-muted text-xs mb-6 text-center">
                {equipment.length === 0
                    ? "No equipment selected — bodyweight will be used"
                    : `${equipment.length} item${equipment.length > 1 ? "s" : ""} selected`}
            </p>

            <button onClick={handleGenerate} className="btn-primary w-full text-center flex items-center justify-center gap-2 mt-auto">
                <Sparkles size={16} />
                Generate Workout Plan
            </button>
        </div>
    );
}
