import { FiMapPin, FiUser, FiClock } from "react-icons/fi";

interface TrackingEvent {
    id: string;
    estado: string;
    localizacao: string | null;
    descricao: string | null;
    hash_evento: string | null;
    created_at: string;
    responsavel?: { nome: string } | null;
}

function getStatusColor(estado: string) {
    const s = estado.toLowerCase();
    if (s.includes("registado") || s.includes("criado")) return "var(--color-info)";
    if (s.includes("trânsito") || s.includes("transporte")) return "var(--color-warning)";
    if (s.includes("entregue") || s.includes("concluído")) return "var(--color-success)";
    if (s.includes("devolvido") || s.includes("cancelado")) return "var(--color-danger)";
    return "var(--color-accent-light)";
}

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
    if (!events.length) {
        return (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Nenhum evento de rastreio registado.
            </p>
        );
    }

    return (
        <div className="space-y-0">
            {events.map((event, idx) => (
                <div key={event.id} className="flex gap-4 animate-fade-in">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                        <div
                            className="w-3 h-3 rounded-full shrink-0 mt-1.5"
                            style={{ background: getStatusColor(event.estado) }}
                        />
                        {idx < events.length - 1 && (
                            <div className="w-px flex-1 min-h-8" style={{ background: "var(--color-border)" }} />
                        )}
                    </div>

                    {/* Content */}
                    <div className="pb-6 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="badge text-xs font-semibold px-2 py-0.5 rounded-lg"
                                style={{
                                    background: `${getStatusColor(event.estado)}20`,
                                    color: getStatusColor(event.estado),
                                }}
                            >
                                {event.estado}
                            </span>
                            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                <FiClock size={12} />
                                {new Date(event.created_at).toLocaleString("pt-PT")}
                            </span>
                        </div>

                        {event.descricao && (
                            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                                {event.descricao}
                            </p>
                        )}

                        <div className="flex gap-4 mt-1 flex-wrap">
                            {event.localizacao && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    <FiMapPin size={12} />
                                    {event.localizacao}
                                </span>
                            )}
                            {event.responsavel?.nome && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    <FiUser size={12} />
                                    {event.responsavel.nome}
                                </span>
                            )}
                        </div>

                        {event.hash_evento && (
                            <code className="hash-display text-xs mt-2 inline-block">
                                {event.hash_evento.slice(0, 16)}...
                            </code>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
