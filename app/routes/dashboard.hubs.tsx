import { useLoaderData, Form, useActionData, useNavigation } from "react-router";
import { FiHome, FiPlus, FiTrash2, FiMapPin, FiBox } from "react-icons/fi";
import { useState } from "react";
import { supabase } from "~/lib/supabase.client";
import { Modal } from "~/components/Modal";
import type { Route } from "./+types/dashboard.hubs";

export function meta() {
    return [{ title: "Centros de Distribuição — ChainTrack" }];
}

export async function clientLoader({ }: Route.ClientLoaderArgs) {
    const { data: centros } = await supabase
        .from("centros_distribuicao")
        .select("*")
        .order("created_at", { ascending: false });

    return { centros: centros || [] };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "create") {
        const nome = formData.get("nome") as string;
        const localizacao = formData.get("localizacao") as string;
        const tipo = formData.get("tipo") as string;
        const capacidadeStr = formData.get("capacidade") as string;
        const capacidade = parseInt(capacidadeStr, 10);

        const { error } = await supabase.from("centros_distribuicao").insert({
            nome,
            localizacao,
            tipo,
            capacidade: isNaN(capacidade) ? null : capacidade,
        });

        if (error) return { error: error.message };
        return { success: "Centro de Distribuição registado com sucesso!" };
    }

    if (intent === "delete") {
        const id = formData.get("id") as string;
        const { error } = await supabase.from("centros_distribuicao").delete().eq("id", id);
        if (error) return { error: error.message };
        return { success: "Centro de Distribuição removido com sucesso!" };
    }

    return null;
}

export default function HubsPage() {
    const { centros } = useLoaderData<typeof clientLoader>();
    const actionData = useActionData<{ error?: string; success?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const tiposDisponiveis = [
        "Fábrica", "Armazém Central", "Centro de Distribuição Regional",
        "Armazém Temporário", "Loja Hub", "Ponto de Recolha"
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiHome style={{ color: "var(--color-accent-light)" }} /> Centros de Distribuição
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Acompanhe os diferentes hubs logísticos da cadeia de transporte.
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
                    <FiPlus size={18} /> Novo Centro
                </button>
            </div>

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

            {/* Tabela de Centros */}
            <div className="card overflow-hidden" style={{ padding: 0 }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(255,255,255,0.02)" }}>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>NOME</th>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>LOCALIZAÇÃO</th>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>TIPO</th>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>CAPACIDADE</th>
                                <th className="p-4 font-medium text-right" style={{ color: "var(--color-text-secondary)" }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {centros.map((centro) => (
                                <tr key={centro.id} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="p-4 font-medium">{centro.nome}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-xs">
                                            <FiMapPin style={{ color: "var(--color-text-muted)" }} />
                                            {centro.localizacao}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="badge" style={{ background: "rgba(255,255,255,0.05)" }}>{centro.tipo}</span>
                                    </td>
                                    <td className="p-4 text-xs font-mono">
                                        {centro.capacidade ? `${centro.capacidade} tons` : "N/D"}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="btn-icon"
                                                title="Remover"
                                                style={{ color: "var(--color-danger)" }}
                                                onClick={() => setDeleteConfirmId(centro.id)}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {centros.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                                        <FiBox size={32} className="mx-auto mb-3 opacity-20" />
                                        Nenhum centro de distribuição registado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo Centro */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Centro de Distribuição">
                <Form method="post" className="space-y-4" onSubmit={() => setTimeout(() => setModalOpen(false), 100)}>
                    <input type="hidden" name="intent" value="create" />

                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Nome do Centro *</label>
                        <input name="nome" type="text" required placeholder="Ex: Hub Douro" />
                    </div>

                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Localização *</label>
                        <input name="localizacao" type="text" required placeholder="Ex: Gouveia, Portugal" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Tipo *</label>
                            <select name="tipo" required>
                                <option value="">Selecione...</option>
                                {tiposDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Capacidade (Tons)</label>
                            <input name="capacidade" type="number" min="0" placeholder="Ex: 500" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn-primary flex-1 justify-center" disabled={isSubmitting}>
                            {isSubmitting ? "A Registar..." : "Registar Centro"}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </button>
                    </div>
                </Form>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Eliminar Centro">
                <div className="space-y-4">
                    <p className="text-sm">Tem a certeza que pretende eliminar este registo? Esta ação não pode ser desfeita.</p>
                    <Form method="post" className="flex gap-3" onSubmit={() => setDeleteConfirmId(null)}>
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={deleteConfirmId || ""} />
                        <button type="submit" className="btn-primary bg-[var(--color-danger)] hover:bg-red-600 flex-1 justify-center" style={{ border: "none" }}>
                            Sim, Eliminar
                        </button>
                        <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setDeleteConfirmId(null)}>
                            Cancelar
                        </button>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}
