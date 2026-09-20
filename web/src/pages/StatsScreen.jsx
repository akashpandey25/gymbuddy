import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { fetchWeeklyStats, fetchStreak, fetchSummary } from "../services/api";

const MUSCLE_COLORS = {
    back: "#00E87A",
    chest: "#f97316",
    legs: "#a78bfa",
    shoulders: "#38bdf8",
    biceps: "#fb923c",
    triceps: "#f472b6",
};

function StatCard({ icon, value, label, sub, color = "text-white" }) {
    return (
        <div className="stat-card">
            <span className="text-2xl">{icon}</span>
            <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
            <span className="text-xs font-semibold text-white">{label}</span>
            {sub && <span className="text-[10px] text-brand-muted">{sub}</span>}
        </div>
    );
}

function SkeletonCard() {
    return <div className="skeleton h-24 rounded-2xl flex-1" />;
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="card py-2 px-3 text-xs border-brand-green/40">
                <p className="font-semibold capitalize">{label}</p>
                <p className="text-brand-green">{payload[0].value} sets</p>
            </div>
        );
    }
    return null;
};

export default function StatsScreen() {
    const navigate = useNavigate();
    const [weekly, setWeekly] = useState(null);
    const [streak, setStreak] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fetchWeeklyStats(), fetchStreak(), fetchSummary()])
            .then(([w, s, sum]) => {
                setWeekly(w);
                setStreak(s);
                setSummary(sum);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const chartData = weekly?.muscles?.map(m => ({
        muscle: m.muscle.charAt(0).toUpperCase() + m.muscle.slice(1),
        sets: parseInt(m.total_sets, 10),
        fill: MUSCLE_COLORS[m.muscle] || "#6b7280",
    })) || [];

    return (
        <div className="min-h-screen px-4 py-10 max-w-md mx-auto page-enter">
            {/* Header */}
            <p className="label mb-2">Overview</p>
            <h2 className="text-2xl font-bold mb-8">Your Stats</h2>

            {error && (
                <div className="card border-red-500/30 bg-red-500/5 text-center py-6 mb-6">
                    <p className="text-red-400 text-sm">{error}</p>
                    <p className="text-brand-muted text-xs mt-1">Make sure the server is running.</p>
                </div>
            )}

            {/* Summary stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                {loading ? (
                    <>
                        <SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </>
                ) : (
                    <>
                        <StatCard
                            icon="🔥"
                            value={streak?.streak ?? 0}
                            label="Day Streak"
                            color="text-brand-green"
                        />
                        <StatCard
                            icon="📅"
                            value={summary?.total_this_month ?? 0}
                            label="This Month"
                            sub="workouts"
                        />
                        <StatCard
                            icon="🏆"
                            value={summary?.all_time_total ?? 0}
                            label="All Time"
                            sub="sessions"
                        />
                    </>
                )}
            </div>

            {/* Top muscle highlight */}
            {!loading && summary?.top_muscle && (
                <div
                    className="card mb-8 flex items-center gap-4"
                    style={{ borderColor: MUSCLE_COLORS[summary.top_muscle] + "55" }}
                >
                    <span className="text-3xl">💪</span>
                    <div>
                        <p className="text-xs text-brand-muted uppercase tracking-wider mb-0.5">Most Trained This Month</p>
                        <p
                            className="text-lg font-bold capitalize"
                            style={{ color: MUSCLE_COLORS[summary.top_muscle] || "#00E87A" }}
                        >
                            {summary.top_muscle}
                        </p>
                        <p className="text-xs text-brand-muted">{summary.top_muscle_sets} sets total</p>
                    </div>
                </div>
            )}

            {/* Weekly Volume Chart */}
            <div className="card mb-8">
                <p className="label mb-1">This Week</p>
                <h3 className="font-bold mb-4">Volume by Muscle</h3>

                {loading ? (
                    <div className="skeleton h-40 rounded-xl" />
                ) : chartData.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-4xl mb-3">📊</p>
                        <p className="text-brand-muted text-sm">No volume data yet.</p>
                        <p className="text-brand-muted text-xs mt-1">Complete a workout to see charts.</p>
                        <button
                            onClick={() => navigate("/")}
                            className="btn-primary mt-4 text-sm"
                        >
                            Start a Workout
                        </button>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barCategoryGap="30%">
                            <XAxis
                                dataKey="muscle"
                                tick={{ fill: "#6b7280", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "#6b7280", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={28}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                            <Bar dataKey="sets" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Volume table */}
            {!loading && chartData.length > 0 && (
                <div className="card">
                    <p className="label mb-3">Weekly Breakdown</p>
                    <div className="space-y-3">
                        {chartData.map(m => (
                            <div key={m.muscle} className="flex items-center gap-3">
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: m.fill }}
                                />
                                <span className="text-sm flex-1">{m.muscle}</span>
                                {/* Progress bar */}
                                <div className="flex-1 bg-brand-border rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-700"
                                        style={{
                                            width: `${Math.min((m.sets / (Math.max(...chartData.map(d => d.sets)) || 1)) * 100, 100)}%`,
                                            background: m.fill,
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-brand-muted w-12 text-right">{m.sets} sets</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
