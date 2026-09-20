import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import useWorkoutStore from "../store/workoutStore";

const QUICK_PICKS = [20, 30, 45, 60];

function timeLabel(t) {
    if (t >= 60) return "60+ min — Full Coverage";
    if (t >= 40) return `${t} min — Primary + Secondary`;
    if (t >= 25) return `${t} min — Essential Compounds`;
    return `${t} min — Best Single Movement`;
}

export default function TimeInput() {
    const navigate = useNavigate();
    const { time, setTime } = useWorkoutStore();
    const [local, setLocal] = useState(time || 45);

    function handleContinue() {
        setTime(local);
        navigate("/equipment");
    }

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
            <p className="label mb-2">Step 2</p>
            <h2 className="text-2xl font-bold mb-2">How much time do you have?</h2>
            <p className="text-brand-muted text-sm mb-8">GymBrain adapts your workout to your time budget.</p>

            {/* Big time display */}
            <div className="card text-center py-8 mb-6 glow-green">
                <div className="text-6xl font-extrabold text-brand-green">{local}</div>
                <div className="text-brand-muted text-xs mt-1">minutes</div>
                <div className="mt-4">
                    <span className="badge-green text-xs">{timeLabel(local)}</span>
                </div>
            </div>

            {/* Slider */}
            <input
                type="range"
                min="10" max="90" step="5"
                value={local}
                onChange={e => setLocal(Number(e.target.value))}
                className="w-full mb-6"
            />
            <div className="flex justify-between text-brand-muted text-xs mb-8">
                <span>10 min</span><span>90 min</span>
            </div>

            {/* Quick picks */}
            <p className="text-brand-muted text-xs mb-3 uppercase tracking-wider">Quick pick</p>
            <div className="grid grid-cols-4 gap-2 mb-10">
                {QUICK_PICKS.map(t => (
                    <button
                        key={t}
                        onClick={() => setLocal(t)}
                        className={`rounded-xl py-2.5 text-sm font-semibold border transition-all
              ${local === t
                                ? "bg-brand-green text-black border-brand-green"
                                : "border-brand-border text-white hover:border-brand-green hover:text-brand-green"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <button onClick={handleContinue} className="btn-primary w-full text-center flex items-center justify-center gap-2">
                Next — Select Equipment
                <ArrowRight size={16} />
            </button>
        </div>
    );
}
