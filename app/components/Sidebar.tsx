import { NavLink } from "react-router";
import { FiUsers, FiBox, FiLogOut, FiMenu, FiX, FiGrid, FiMap, FiCamera, FiHome, FiActivity } from "react-icons/fi";
import { useState } from "react";

const navItems = [
    { to: "/dashboard", icon: FiGrid, label: "Dashboard", end: true },
    { to: "/dashboard/acompanhamento", icon: FiActivity, label: "Acompanhamento" },
    { to: "/dashboard/users", icon: FiUsers, label: "Utilizadores" },
    { to: "/dashboard/hubs", icon: FiHome, label: "Centros de Distr." },
    { to: "/dashboard/planning", icon: FiMap, label: "Planeamento" },
    { to: "/dashboard/products", icon: FiBox, label: "Produtos" },
    { to: "/dashboard/scan", icon: FiCamera, label: "Scanner QR" },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="fixed top-4 left-4 z-50 btn-icon lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-40 w-64 flex flex-col transition-transform duration-300
          lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
                style={{
                    background: "var(--color-bg-secondary)",
                    borderRight: "1px solid var(--color-border)",
                }}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-glow"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}
                    >
                        <FiBox size={20} color="white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold gradient-text">ChainTrack</h1>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Supply Chain Tracker</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 mt-4">
                    <ul className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? "text-white"
                                            : "hover:bg-[var(--color-bg-card)]"
                                        }`
                                    }
                                    style={({ isActive }) =>
                                        isActive
                                            ? {
                                                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                                                color: "white",
                                            }
                                            : { color: "var(--color-text-secondary)" }
                                    }
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User section */}
                <div
                    className="p-4 m-4 rounded-xl"
                    style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
                >
                    <p className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>
                        {userEmail || "user@email.com"}
                    </p>
                    <form method="post" action="/auth/logout" className="mt-2">
                        <button
                            type="submit"
                            className="flex items-center gap-2 text-xs font-medium"
                            style={{ color: "var(--color-danger)" }}
                        >
                            <FiLogOut size={14} />
                            Sair
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
