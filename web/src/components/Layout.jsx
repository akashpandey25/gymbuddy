import { useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart2, Clock } from "lucide-react";

// Pages that show the bottom nav
const NAV_PAGES = ["/", "/history", "/stats"];

const NAV_ITEMS = [
    { path: "/", Icon: Home, label: "Home" },
    { path: "/stats", Icon: BarChart2, label: "Stats" },
    { path: "/history", Icon: Clock, label: "History" },
];

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const showNav = NAV_PAGES.includes(location.pathname);

    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Main content */}
            <main className={`flex-1 ${showNav ? "pb-nav" : ""}`}>
                {children}
            </main>

            {/* Bottom Navigation */}
            {showNav && (
                <nav
                    className="fixed bottom-0 left-0 right-0 z-50"
                    style={{
                        background: "rgba(10, 10, 12, 0.94)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <div className="max-w-md mx-auto flex items-center justify-around px-3 py-3">
                        {NAV_ITEMS.map(({ path, Icon, label }) => {
                            const active = location.pathname === path;
                            return (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className="flex flex-col items-center gap-1.5 px-5 py-2 rounded-2xl transition-all duration-200 relative"
                                    style={{
                                        background: active ? "rgba(0,232,122,0.1)" : "transparent",
                                        color: active ? "#00E87A" : "#4b5563",
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={active ? 2.4 : 1.8}
                                        color={active ? "#00E87A" : "#4b5563"}
                                    />
                                    <span
                                        className="text-[10px] font-semibold tracking-wide"
                                        style={{ color: active ? "#00E87A" : "#4b5563" }}
                                    >
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
}
