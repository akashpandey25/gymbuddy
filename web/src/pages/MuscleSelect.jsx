import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const MUSCLES = [
    {
        id: "back",
        icon: "/back.png",
        color: "#00E87A",
        bg: "rgba(0,232,122,0.1)",
        label: "Back",
        sub: "Lats · Rhomboids · Deadlift",
    },
    {
        id: "chest",
        icon: "/chest.png",
        color: "#F97316",
        bg: "rgba(249,115,22,0.1)",
        label: "Chest",
        sub: "Press · Fly · Push",
    },
    {
        id: "legs",
        icon: "/leg.png",
        color: "#A78BFA",
        bg: "rgba(167,139,250,0.1)",
        label: "Legs",
        sub: "Quads · Hams · Glutes",
    },
    {
        id: "shoulders",
        icon: "/shoulder.png",
        color: "#38BDF8",
        bg: "rgba(56,189,248,0.1)",
        label: "Shoulders",
        sub: "Delts · Press · Rear Delts",
    },
    {
        id: "biceps",
        icon: "/biceps.png",
        color: "#FB7185",
        bg: "rgba(251,113,133,0.1)",
        label: "Biceps",
        sub: "Curl Variations",
    },
    {
        id: "triceps",
        icon: "/tricep.png",
        color: "#FBBF24",
        bg: "rgba(251,191,36,0.1)",
        label: "Triceps",
        sub: "Push · Extension · Dip",
    },
];

export default function MuscleSelect() {
    const navigate = useNavigate();
    const { setTarget, setMode } = useWorkoutStore();

    function handleSelect(m) {
        setMode("single");
        setTarget([m.id]);
        navigate("/time");
    }

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto page-enter">
            {/* Header */}
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
                style={{ color: "#6b7280" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
            >
                <ChevronLeft size={16} />
                Back
            </button>
            <p className="label mb-2">Single Muscle</p>
            <h2 className="text-2xl font-bold mb-6">Which muscle today?</h2>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3">
                {MUSCLES.map(m => (
                    <button
                        key={m.id}
                        onClick={() => handleSelect(m)}
                        className="text-left rounded-2xl p-4 transition-all duration-150 group relative overflow-hidden"
                        style={{ background: "#161618", border: "1px solid #2A2A2E" }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = m.color;
                            e.currentTarget.style.boxShadow = `0 0 20px ${m.color}22`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#2A2A2E";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        {/* Icon box with real PNG */}
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: m.bg }}
                        >
                            <img
                                src={m.icon}
                                alt={m.label}
                                className="w-9 h-9 object-contain"
                                style={{ filter: `brightness(0) saturate(100%) invert(1) sepia(1) saturate(5) hue-rotate(${hueForColor(m.color)})` }}
                            />
                        </div>
                        <div className="font-semibold text-sm text-white">{m.label}</div>
                        <div className="text-xs mt-1 leading-snug" style={{ color: "#6b7280" }}>{m.sub}</div>

                        {/* Arrow */}
                        <ChevronRight
                            size={14}
                            color={m.color}
                            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

// Maps hex accent colours to CSS hue-rotate degrees so the white-on-grey PNGs
// get tinted to match each card's colour scheme.
function hueForColor(hex) {
    const map = {
        "#00E87A": "100deg",   // green
        "#F97316": "20deg",    // orange
        "#A78BFA": "250deg",   // purple
        "#38BDF8": "190deg",   // sky
        "#FB7185": "330deg",   // rose
        "#FBBF24": "38deg",    // amber
    };
    return map[hex] ?? "0deg";
}
