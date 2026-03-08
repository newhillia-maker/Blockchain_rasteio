import type { IconType } from "react-icons";

interface StatsCardProps {
    icon: IconType;
    label: string;
    value: string | number;
    change?: string;
    positive?: boolean;
}

export function StatsCard({ icon: Icon, label, value, change, positive }: StatsCardProps) {
    return (
        <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0, 204, 102, 0.1)" }}
                >
                    <Icon size={20} style={{ color: "var(--color-accent-light)" }} />
                </div>
                {change && (
                    <span
                        className="text-xs font-semibold"
                        style={{ color: positive ? "var(--color-success)" : "var(--color-danger)" }}
                    >
                        {positive ? "↑" : "↓"} {change}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                {label}
            </p>
        </div>
    );
}
