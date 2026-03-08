import { useLoaderData, Form, useActionData, useNavigation } from "react-router";
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";
import { useState } from "react";
import { Modal } from "~/components/Modal";
import { supabase } from "~/lib/supabase.server";
import type { Route } from "./+types/dashboard.users";

export function meta() {
    return [{ title: "Utilizadores — ChainTrack" }];
}

export async function loader({ }: Route.LoaderArgs) {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    return { users: data || [], error: error?.message };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "create") {
        const nome = formData.get("nome") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;

        const { error } = await supabase.from("profiles").insert({
            id: crypto.randomUUID(),
            nome,
            email,
            role: role || "viewer",
        });

        if (error) return { error: error.message };
        return { success: "Utilizador criado com sucesso!" };
    }

    if (intent === "update") {
        const id = formData.get("id") as string;
        const nome = formData.get("nome") as string;
        const role = formData.get("role") as string;

        const { error } = await supabase.from("profiles").update({ nome, role }).eq("id", id);

        if (error) return { error: error.message };
        return { success: "Utilizador atualizado!" };
    }

    if (intent === "delete") {
        const id = formData.get("id") as string;
        const { error } = await supabase.from("profiles").delete().eq("id", id);

        if (error) return { error: error.message };
        return { success: "Utilizador eliminado!" };
    }

    return {};
}

export default function UsersPage() {
    const { users } = useLoaderData<typeof loader>();
    const actionData = useActionData<{ error?: string; success?: string }>();
    const navigation = useNavigation();
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);

    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiUsers style={{ color: "var(--color-accent-light)" }} /> Utilizadores
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Gerir os utilizadores da plataforma
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => { setEditUser(null); setModalOpen(true); }}
                >
                    <FiPlus size={18} /> Novo Utilizador
                </button>
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
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Função</th>
                                <th>Data</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8" style={{ color: "var(--color-text-muted)" }}>
                                        Nenhum utilizador registado.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user.id}>
                                        <td className="font-medium" style={{ color: "var(--color-text-primary)" }}>{user.nome}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${user.role === "admin" ? "badge-danger" :
                                                    user.role === "operador" ? "badge-warning" : "badge-info"
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-xs">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString("pt-PT") : "-"}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => { setEditUser(user); setModalOpen(true); }}
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <Form method="post">
                                                    <input type="hidden" name="intent" value="delete" />
                                                    <input type="hidden" name="id" value={user.id} />
                                                    <button type="submit" className="btn-icon" style={{ color: "var(--color-danger)" }}>
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
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editUser ? "Editar Utilizador" : "Novo Utilizador"}
            >
                <Form method="post" className="space-y-4" onSubmit={() => setModalOpen(false)}>
                    <input type="hidden" name="intent" value={editUser ? "update" : "create"} />
                    {editUser && <input type="hidden" name="id" value={editUser.id} />}

                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Nome</label>
                        <input name="nome" defaultValue={editUser?.nome || ""} required placeholder="Nome completo" />
                    </div>

                    {!editUser && (
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Email</label>
                            <input name="email" type="email" required placeholder="email@exemplo.com" />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Função</label>
                        <select name="role" defaultValue={editUser?.role || "viewer"}>
                            <option value="admin">Admin</option>
                            <option value="operador">Operador</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary flex-1 justify-center" disabled={isSubmitting}>
                            {isSubmitting ? "A guardar..." : editUser ? "Guardar" : "Criar"}
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
