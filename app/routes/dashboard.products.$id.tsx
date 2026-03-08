import { useLoaderData, Form, useActionData, Link } from "react-router";
import { FiArrowLeft, FiMapPin, FiHash, FiClock, FiPlus, FiUser, FiMap } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { Suspense, lazy } from "react";
import { HashDisplay } from "~/components/HashDisplay";
import { TrackingTimeline } from "~/components/TrackingTimeline";
import { Modal } from "~/components/Modal";
import { ClientOnly } from "~/components/ClientOnly";
import { supabase } from "~/lib/supabase.client";
import { generateEventHash } from "~/lib/hash";

const TrackingMap = lazy(() => import("~/components/TrackingMap.client"));
import { useState } from "react";
import type { Route } from "./+types/dashboard.products.$id";

export function meta() {
    return [{ title: "Detalhe do Produto — ChainTrack" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const { data: product } = await supabase
        .from("produtos")
        .select("*, responsavel:profiles(nome)")
        .eq("id", params.id)
        .single();

    if (!product) {
        throw new Response("Produto não encontrado", { status: 404 });
    }

    const { data: events } = await supabase
        .from("tracking_events")
        .select("*, responsavel:profiles(nome)")
        .eq("produto_id", params.id)
        .order("created_at", { ascending: false });

    return { product, events: events || [] };
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const estado = formData.get("estado") as string;
    const localizacao = formData.get("localizacao") as string;
    const descricao = formData.get("descricao") as string;

    const { data: product } = await supabase
        .from("produtos")
        .select("hash_rastreio")
        .eq("id", params.id)
        .single();

    if (!product) return { error: "Produto não encontrado." };

    const hashEvento = generateEventHash({
        productHash: product.hash_rastreio,
        estado,
        localizacao,
        timestamp: new Date().toISOString(),
    });

    const { error: eventError } = await supabase.from("tracking_events").insert({
        produto_id: params.id,
        estado,
        localizacao,
        descricao,
        hash_evento: hashEvento,
    });

    if (eventError) return { error: eventError.message };

    await supabase.from("produtos").update({ estado_atual: estado }).eq("id", params.id);

    return { success: "Rastreio atualizado!" };
}

const estadoOptions = [
    "Registado", "Em Produção", "Controlo de Qualidade",
    "Embalado", "Em Armazém", "Em Trânsito",
    "No Centro de Distribuição", "Em Entrega", "Entregue", "Devolvido",
];

export default function ProductDetailPage() {
    const { product, events } = useLoaderData<typeof clientLoader>();
    const actionData = useActionData<{ error?: string; success?: string }>();
    const [modalOpen, setModalOpen] = useState(false);

    const trackingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/track/${product.hash_rastreio}`;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link to="/dashboard/products" className="inline-flex items-center gap-2 text-sm btn-secondary">
                <FiArrowLeft size={14} /> Voltar
            </Link>

            {actionData?.success && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(0,204,102,0.1)", color: "var(--color-success)" }}>
                    {actionData.success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{product.nome}</h1>
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    Código: {product.codigo}
                                </p>
                            </div>
                            <span className={`badge ${product.estado_atual.toLowerCase().includes("entregue") ? "badge-success" :
                                product.estado_atual.toLowerCase().includes("trânsito") ? "badge-warning" : "badge-info"
                                }`}>
                                {product.estado_atual}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <FiMapPin size={16} style={{ color: "var(--color-accent-light)" }} />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Origem</p>
                                    <p className="text-sm font-medium">{product.origem}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiUser size={16} style={{ color: "var(--color-accent-light)" }} />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Responsável</p>
                                    <p className="text-sm font-medium">{product.responsavel?.nome || "Não atribuído"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiClock size={16} style={{ color: "var(--color-accent-light)" }} />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Registado em</p>
                                    <p className="text-sm font-medium">{new Date(product.created_at).toLocaleDateString("pt-PT")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiHash size={16} style={{ color: "var(--color-accent-light)" }} />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Hash</p>
                                    <HashDisplay hash={product.hash_rastreio} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Destinos Planeados */}
                    {product.destinos_planeados && Array.isArray(product.destinos_planeados) && product.destinos_planeados.length > 0 && (
                        <div className="card">
                            <div className="flex items-center mb-4 gap-2">
                                <FiMap style={{ color: "var(--color-accent-light)" }} />
                                <h2 className="text-lg font-bold">Rota Planeada</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.destinos_planeados.map((destino: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
                                            {idx + 1}. {destino}
                                        </div>
                                        {idx < product.destinos_planeados.length - 1 && (
                                            <div style={{ color: "var(--color-text-muted)" }}>→</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Histórico de Rastreio</h2>
                            <button className="btn-primary text-sm" onClick={() => setModalOpen(true)}>
                                <FiPlus size={16} /> Novo Evento
                            </button>
                        </div>
                        <TrackingTimeline events={events} />
                    </div>
                </div>

                {/* QR Code sidebar */}
                <div className="space-y-6">
                    <div className="card text-center">
                        <h3 className="text-sm font-bold mb-4">QR Code de Rastreio</h3>
                        <div className="bg-white rounded-xl p-4 inline-block">
                            <QRCodeSVG value={trackingUrl} size={180} />
                        </div>
                        <p className="text-xs mt-4" style={{ color: "var(--color-text-muted)" }}>
                            Escaneie para ver o rastreio público
                        </p>
                        <div className="mt-4">
                            <code className="hash-display text-xs block">{product.hash_rastreio}</code>
                        </div>
                    </div>

                    {/* Map Panel */}
                    <div className="card p-2 w-full h-[300px]">
                        <ClientOnly fallback={<div className="h-full w-full flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">A carregar mapa...</div>}>
                            {() => (
                                <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-[var(--color-text-muted)]">A carregar mapa...</div>}>
                                    <TrackingMap produtos={[product]} events={events} />
                                </Suspense>
                            )}
                        </ClientOnly>
                    </div>
                </div>
            </div>

            {/* Add event modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Evento de Rastreio">
                <Form method="post" className="space-y-4" onSubmit={() => setModalOpen(false)}>
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                            Novo Estado *
                        </label>
                        <select name="estado" required>
                            {estadoOptions.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                            Localização
                        </label>
                        <input name="localizacao" placeholder="Ex: Porto, Portugal" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                            Descrição
                        </label>
                        <textarea name="descricao" rows={3} placeholder="Detalhes do evento..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary flex-1 justify-center">
                            Registar Evento
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
