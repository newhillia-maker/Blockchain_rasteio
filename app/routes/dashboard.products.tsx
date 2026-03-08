import { useLoaderData, Form, useActionData, useNavigation, Link } from "react-router";
import { FiPlus, FiEdit2, FiTrash2, FiBox, FiEye, FiSearch } from "react-icons/fi";
import { useState } from "react";
import { Modal } from "~/components/Modal";
import { HashDisplay } from "~/components/HashDisplay";
import { supabase } from "~/lib/supabase.server";
import { generateProductHash } from "~/lib/hash";
import type { Route } from "./+types/dashboard.products";

export function meta() {
    return [{ title: "Produtos — ChainTrack" }];
}

export async function loader({ }: Route.LoaderArgs) {
    const { data, error } = await supabase
        .from("produtos")
        .select("*, responsavel:profiles(nome)")
        .order("created_at", { ascending: false });

    return { products: data || [], error: error?.message };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "create") {
        const codigo = formData.get("codigo") as string;
        const nome = formData.get("nome") as string;
        const origem = formData.get("origem") as string;

        if (!codigo || !nome || !origem) {
            return { error: "Preencha todos os campos obrigatórios." };
        }

        const timestamp = new Date().toISOString();
        const hash = generateProductHash({ codigo, nome, origem, timestamp });

        const { error } = await supabase.from("produtos").insert({
            codigo,
            nome,
            origem,
            estado_atual: "Registado",
            hash_rastreio: hash,
            qr_code_data: `/track/${hash}`,
        });

        if (error) return { error: error.message };

        // Create initial tracking event
        const { data: produto } = await supabase
            .from("produtos")
            .select("id")
            .eq("hash_rastreio", hash)
            .single();

        if (produto) {
            await supabase.from("tracking_events").insert({
                produto_id: produto.id,
                estado: "Registado",
                localizacao: origem,
                descricao: `Produto "${nome}" registado na plataforma.`,
                hash_evento: hash.slice(0, 32),
            });
        }

        return { success: "Produto registado com sucesso!" };
    }

    if (intent === "update") {
        const id = formData.get("id") as string;
        const nome = formData.get("nome") as string;
        const origem = formData.get("origem") as string;
        const estado = formData.get("estado_atual") as string;

        const { error } = await supabase
            .from("produtos")
            .update({ nome, origem, estado_atual: estado })
            .eq("id", id);

        if (error) return { error: error.message };
        return { success: "Produto atualizado!" };
    }

    if (intent === "delete") {
        const id = formData.get("id") as string;
        const { error } = await supabase.from("produtos").delete().eq("id", id);
        if (error) return { error: error.message };
        return { success: "Produto eliminado!" };
    }

    return {};
}

const estadoOptions = [
    "Registado",
    "Em Produção",
    "Controlo de Qualidade",
    "Embalado",
    "Em Armazém",
    "Em Trânsito",
    "No Centro de Distribuição",
    "Em Entrega",
    "Entregue",
    "Devolvido",
];

function getStatusBadge(estado: string) {
    const s = estado.toLowerCase();
    if (s.includes("entregue") || s.includes("concluído")) return "badge-success";
    if (s.includes("trânsito") || s.includes("transporte") || s.includes("entrega")) return "badge-warning";
    if (s.includes("devolvido") || s.includes("cancelado")) return "badge-danger";
    return "badge-info";
}

export default function ProductsPage() {
    const { products } = useLoaderData<typeof loader>();
    const actionData = useActionData<{ error?: string; success?: string }>();
    const navigation = useNavigation();
    const [modalOpen, setModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [search, setSearch] = useState("");
    const isSubmitting = navigation.state === "submitting";

    const filtered = products.filter(
        (p: any) =>
            p.nome.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo.toLowerCase().includes(search.toLowerCase()) ||
            p.origem.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiBox style={{ color: "var(--color-accent-light)" }} /> Produtos
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Gerir produtos e gerar hashes de rastreio
                    </p>
                </div>
                <button className="btn-primary" onClick={() => { setEditProduct(null); setModalOpen(true); }}>
                    <FiPlus size={18} /> Novo Produto
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--color-text-muted)" }} />
                <input
                    type="text"
                    placeholder="Pesquisar por nome, código ou origem..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: "2.5rem" }}
                />
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

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Origem</th>
                                <th>Estado</th>
                                <th>Hash</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8" style={{ color: "var(--color-text-muted)" }}>
                                        {search ? "Nenhum produto encontrado." : "Nenhum produto registado."}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p: any) => (
                                    <tr key={p.id}>
                                        <td className="font-medium" style={{ color: "var(--color-text-primary)" }}>{p.codigo}</td>
                                        <td>{p.nome}</td>
                                        <td className="text-xs">{p.origem}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(p.estado_atual)}`}>{p.estado_atual}</span>
                                        </td>
                                        <td>
                                            <HashDisplay hash={p.hash_rastreio} />
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Link to={`/dashboard/products/${p.id}`} className="btn-icon" title="Ver detalhes">
                                                    <FiEye size={14} />
                                                </Link>
                                                <button className="btn-icon" onClick={() => { setEditProduct(p); setModalOpen(true); }} title="Editar">
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <Form method="post">
                                                    <input type="hidden" name="intent" value="delete" />
                                                    <input type="hidden" name="id" value={p.id} />
                                                    <button type="submit" className="btn-icon" style={{ color: "var(--color-danger)" }} title="Eliminar">
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </Form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? "Editar Produto" : "Novo Produto"}>
                <Form method="post" className="space-y-4" onSubmit={() => setModalOpen(false)}>
                    <input type="hidden" name="intent" value={editProduct ? "update" : "create"} />
                    {editProduct && <input type="hidden" name="id" value={editProduct.id} />}

                    {!editProduct && (
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Código do Produto *
                            </label>
                            <input name="codigo" required placeholder="Ex: PRD-001" />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                            Nome do Produto *
                        </label>
                        <input name="nome" defaultValue={editProduct?.nome || ""} required placeholder="Nome do produto" />
                    </div>

                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                            Local de Produção *
                        </label>
                        <input name="origem" defaultValue={editProduct?.origem || ""} required placeholder="Ex: Lisboa, Portugal" />
                    </div>

                    {editProduct && (
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Estado Atual
                            </label>
                            <select name="estado_atual" defaultValue={editProduct?.estado_atual || "Registado"}>
                                {estadoOptions.map((e) => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary flex-1 justify-center" disabled={isSubmitting}>
                            {isSubmitting ? "A guardar..." : editProduct ? "Guardar" : "Registar Produto"}
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
