import { useLoaderData } from "react-router";
import { FiBox, FiMapPin, FiClock, FiHash, FiCheckCircle } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { Suspense, lazy } from "react";
import { TrackingTimeline } from "~/components/TrackingTimeline";
import { ClientOnly } from "~/components/ClientOnly";
import { supabase } from "~/lib/supabase.client";
import type { Route } from "./+types/track.$hash";

const TrackingMap = lazy(() => import("~/components/TrackingMap.client"));

export function meta() {
    return [{ title: "Rastreio de Produto — ChainTrack" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const hash = params.hash;

    // Demo mode
    if (hash === "demo") {
        return {
            product: {
                codigo: "DEMO-001",
                nome: "Produto Demo",
                origem: "Lisboa, Portugal",
                destinos_planeados: ["Coimbra", "Porto"],
                estado_atual: "Em Trânsito",
                hash_rastreio: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                created_at: new Date().toISOString(),
            },
            events: [
                { id: "1", estado: "Registado", localizacao: "Lisboa, Portugal", descricao: "Produto registado na plataforma.", hash_evento: "abc123", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
                { id: "2", estado: "Em Produção", localizacao: "Fábrica Porto", descricao: "Produção iniciada.", hash_evento: "def456", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
                { id: "3", estado: "Em Trânsito", localizacao: "A1 - Porto → Lisboa", descricao: "Em transporte rodoviário.", hash_evento: "ghi789", created_at: new Date(Date.now() - 86400000).toISOString() },
            ],
            isDemo: true,
        };
    }

    const { data: product } = await supabase
        .from("produtos")
        .select("*")
        .eq("hash_rastreio", hash)
        .single();

    if (!product) {
        throw new Response("Produto não encontrado", { status: 404 });
    }

    const { data: events } = await supabase
        .from("tracking_events")
        .select("*, responsavel:profiles(nome)")
        .eq("produto_id", product.id)
        .order("created_at", { ascending: false });

    return { product, events: events || [], isDemo: false };
}

function getStatusIcon(estado: string) {
    const s = estado.toLowerCase();
    if (s.includes("entregue")) return <FiCheckCircle size={24} style={{ color: "var(--color-success)" }} />;
    return <FiBox size={24} style={{ color: "var(--color-accent-light)" }} />;
}

export default function PublicTrackingPage() {
    const { product, events, isDemo } = useLoaderData<typeof clientLoader>();

    return (
        <div className="min-h-screen px-4 py-8" style={{ background: "var(--color-bg-primary)" }}>
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}
                        >
                            <FiBox size={20} color="white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">ChainTrack</span>
                    </div>
                    <h1 className="text-2xl font-bold">Rastreio de Produto</h1>
                    {isDemo && (
                        <span className="badge badge-warning mt-2">Modo Demonstração</span>
                    )}
                </div>

                {/* Product card */}
                <div className="card">
                    <div className="flex items-center gap-4 mb-4">
                        {getStatusIcon(product.estado_atual)}
                        <div>
                            <h2 className="text-xl font-bold">{product.nome}</h2>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Código: {product.codigo}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <FiMapPin size={14} style={{ color: "var(--color-accent-light)" }} />
                            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Origem: <strong style={{ color: "var(--color-text-primary)" }} className="block truncate" title={product.origem}>{product.origem}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiMapPin size={14} style={{ color: "var(--color-accent-light)" }} />
                            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Destino: <strong style={{ color: "var(--color-text-primary)" }} className="block truncate" title={product.destinos_planeados?.[product.destinos_planeados.length - 1] || "Não definido"}>{product.destinos_planeados?.[product.destinos_planeados.length - 1] || "Não definido"}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiClock size={14} style={{ color: "var(--color-accent-light)" }} />
                            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Registado: <strong style={{ color: "var(--color-text-primary)" }} className="block">
                                    {new Date(product.created_at).toLocaleDateString("pt-PT")}
                                </strong>
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <FiHash size={14} style={{ color: "var(--color-accent-light)" }} />
                        <code className="hash-display text-xs">{product.hash_rastreio}</code>
                    </div>

                    <div className="mt-4 p-3 rounded-xl text-center" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Estado Atual</p>
                        <span className={`badge text-base ${product.estado_atual.toLowerCase().includes("entregue") ? "badge-success" :
                            product.estado_atual.toLowerCase().includes("trânsito") ? "badge-warning" : "badge-info"
                            }`}>
                            {product.estado_atual}
                        </span>
                    </div>
                </div>

                {/* Map Panel */}
                <div className="card p-2 w-full h-[350px]">
                    <ClientOnly fallback={<div className="h-full w-full flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">A carregar mapa...</div>}>
                        {() => (
                            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-[var(--color-text-muted)]">A carregar mapa...</div>}>
                                <TrackingMap produtos={[product]} events={events} />
                            </Suspense>
                        )}
                    </ClientOnly>
                </div>

                {/* Timeline */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6">Histórico de Eventos</h3>
                    <TrackingTimeline events={events} />
                </div>

                {/* Footer */}
                <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Verificado por ChainTrack — Supply Chain Blockchain Tracker
                </p>
            </div>
        </div>
    );
}
