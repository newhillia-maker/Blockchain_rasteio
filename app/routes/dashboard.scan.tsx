import { Form, useActionData, useNavigation } from "react-router";
import { FiCamera, FiHash, FiSearch } from "react-icons/fi";
import { useState } from "react";
import { supabase } from "~/lib/supabase.client";
import { generateEventHash } from "~/lib/hash";
import type { Route } from "./+types/dashboard.scan";

export function meta() {
    return [{ title: "Scanner QR — ChainTrack" }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "search") {
        const hash = formData.get("hash") as string;

        const { data: product } = await supabase
            .from("produtos")
            .select("id, codigo, nome, estado_atual, hash_rastreio, origem")
            .eq("hash_rastreio", hash)
            .single();

        if (!product) return { error: "Produto não encontrado com esta hash.", product: null };
        return { product };
    }

    if (intent === "update") {
        const produtoId = formData.get("produto_id") as string;
        const estado = formData.get("estado") as string;
        const localizacao = formData.get("localizacao") as string;
        const descricao = formData.get("descricao") as string;
        const productHash = formData.get("product_hash") as string;

        const hashEvento = generateEventHash({
            productHash,
            estado,
            localizacao,
            timestamp: new Date().toISOString(),
        });

        const { error: eventError } = await supabase.from("tracking_events").insert({
            produto_id: produtoId,
            estado,
            localizacao,
            descricao,
            hash_evento: hashEvento,
        });

        if (eventError) return { error: eventError.message, product: null };

        await supabase.from("produtos").update({ estado_atual: estado }).eq("id", produtoId);

        return { success: "Rastreio atualizado com sucesso!", product: null };
    }

    return { product: null };
}

const estadoOptions = [
    "Em Produção", "Controlo de Qualidade", "Embalado",
    "Em Armazém", "Em Trânsito", "No Centro de Distribuição",
    "Em Entrega", "Entregue", "Devolvido",
];

export default function ScanPage() {
    const actionData = useActionData<{
        error?: string;
        success?: string;
        product?: any;
    }>();
    const navigation = useNavigation();
    const [hashInput, setHashInput] = useState("");
    const isSubmitting = navigation.state === "submitting";

    const product = actionData?.product;

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FiCamera style={{ color: "var(--color-accent-light)" }} /> Scanner de Rastreio
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Pesquise por hash ou escaneie o QR code para atualizar o estado do produto
                </p>
            </div>

            {/* Feedback */}
            {actionData?.error && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(231,76,60,0.1)", color: "var(--color-danger)" }}>
                    {actionData.error}
                </div>
            )}
            {actionData?.success && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(0,204,102,0.1)", color: "var(--color-success)" }}>
                    {actionData.success}
                </div>
            )}

            {/* Search by hash */}
            <div className="card">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiHash size={18} /> Pesquisar por Hash
                </h2>
                <Form method="post" className="flex gap-3">
                    <input type="hidden" name="intent" value="search" />
                    <input
                        name="hash"
                        value={hashInput}
                        onChange={(e) => setHashInput(e.target.value)}
                        placeholder="Cole a hash do produto aqui..."
                        className="flex-1"
                        style={{ fontFamily: "'Courier New', monospace" }}
                    />
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        <FiSearch size={16} /> Buscar
                    </button>
                </Form>
            </div>

            {/* Found product */}
            {product && (
                <div className="card animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">Produto Encontrado</h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Código</p>
                            <p className="font-medium">{product.codigo}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Nome</p>
                            <p className="font-medium">{product.nome}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Origem</p>
                            <p className="font-medium">{product.origem}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Estado Atual</p>
                            <span className="badge badge-info">{product.estado_atual}</span>
                        </div>
                    </div>

                    <hr style={{ borderColor: "var(--color-border)" }} className="my-4" />

                    <h3 className="text-sm font-bold mb-3">Atualizar Estado</h3>
                    <Form method="post" className="space-y-3">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="produto_id" value={product.id} />
                        <input type="hidden" name="product_hash" value={product.hash_rastreio} />

                        <select name="estado" required>
                            <option value="">Selecionar novo estado...</option>
                            {estadoOptions.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>

                        <input name="localizacao" placeholder="Localização atual" />
                        <textarea name="descricao" rows={2} placeholder="Descrição do evento..." />

                        <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
                            {isSubmitting ? "A atualizar..." : "Atualizar Rastreio"}
                        </button>
                    </Form>
                </div>
            )}

            {/* QR Camera hint */}
            <div className="card text-center">
                <FiCamera size={40} className="mx-auto mb-3" style={{ color: "var(--color-text-muted)" }} />
                <h3 className="font-bold mb-2">Scanner de QR Code</h3>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Use a câmera do seu dispositivo para escanear o QR code do produto.
                    O QR code redireciona para a página de rastreio público onde pode
                    verificar o estado da mercadoria.
                </p>
                <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
                    💡 Dica: Copie a hash do QR code e cole no campo de pesquisa acima para atualizar o rastreio.
                </p>
            </div>
        </div>
    );
}
