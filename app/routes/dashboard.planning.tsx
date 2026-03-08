import { useLoaderData, Form, useActionData, useNavigation } from "react-router";
import { FiMap, FiPlus, FiTrash2, FiSave, FiBox, FiUser } from "react-icons/fi";
import { useState } from "react";
import { supabase } from "~/lib/supabase.server";
import type { Route } from "./+types/dashboard.planning";

export function meta() {
    return [{ title: "Planeamento de Rota — ChainTrack" }];
}

export async function loader({ }: Route.LoaderArgs) {
    // Fetch profiles (responsáveis)
    const { data: users } = await supabase
        .from("profiles")
        .select("id, nome, role")
        .order("nome");

    // Fetch products that haven't been delivered
    const { data: products } = await supabase
        .from("produtos")
        .select("id, codigo, nome, responsavel_id, destinos_planeados")
        .neq("estado_atual", "Entregue")
        .order("created_at", { ascending: false });

    return { users: users || [], products: products || [] };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const produto_id = formData.get("produto_id") as string;
    const responsavel_id = formData.get("responsavel_id") as string;
    const destinosJson = formData.get("destinos") as string;

    if (!produto_id) {
        return { error: "Selecione um produto." };
    }

    let destinos_planeados = [];
    try {
        destinos_planeados = JSON.parse(destinosJson || "[]");
    } catch (e) {
        destinos_planeados = [];
    }

    const { error } = await supabase
        .from("produtos")
        .update({
            responsavel_id: responsavel_id || null,
            destinos_planeados
        })
        .eq("id", produto_id);

    if (error) return { error: error.message };

    return { success: "Planeamento de rota guardado com sucesso!" };
}

export default function PlanningPage() {
    const { users, products } = useLoaderData<typeof loader>();
    const actionData = useActionData<{ error?: string; success?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [responsavelId, setResponsavelId] = useState<string>("");
    const [destinos, setDestinos] = useState<string[]>([""]);

    // When a product is selected, optionally preload its existing data
    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pid = e.target.value;
        setSelectedProduct(pid);
        const prod = products.find(p => p.id === pid);
        if (prod) {
            setResponsavelId(prod.responsavel_id || "");
            if (prod.destinos_planeados && Array.isArray(prod.destinos_planeados) && prod.destinos_planeados.length > 0) {
                setDestinos(prod.destinos_planeados);
            } else {
                setDestinos([""]);
            }
        } else {
            setResponsavelId("");
            setDestinos([""]);
        }
    };

    const addDestino = () => setDestinos([...destinos, ""]);
    const updateDestino = (index: number, value: string) => {
        const newD = [...destinos];
        newD[index] = value;
        setDestinos(newD);
    };
    const removeDestino = (index: number) => {
        setDestinos(destinos.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FiMap style={{ color: "var(--color-accent-light)" }} /> Planeamento de Cadeia Logística
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Defina o responsável e os pontos de paragem previstos para o rastreamento do produto.
                </p>
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

            <div className="card">
                <Form method="post" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Produto Selection */}
                        <div>
                            <label className="text-xs font-medium mb-1 block flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
                                <FiBox /> Produto da Cadeia *
                            </label>
                            <select name="produto_id" required value={selectedProduct} onChange={handleProductChange} className="w-full">
                                <option value="">-- Selecione o Produto --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
                                ))}
                            </select>
                        </div>

                        {/* Responsável Selection */}
                        <div>
                            <label className="text-xs font-medium mb-1 block flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
                                <FiUser /> Responsável pelo Transporte
                            </label>
                            <select name="responsavel_id" value={responsavelId} onChange={e => setResponsavelId(e.target.value)} className="w-full">
                                <option value="">-- Nenhum / Por Definir --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.nome} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <hr style={{ borderColor: "var(--color-border)" }} />

                    {/* Destinos */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                Pontos de Rastreio Planeados (Rota)
                            </label>
                            <button type="button" onClick={addDestino} className="btn-secondary text-xs py-1 px-2">
                                <FiPlus /> Adicionar Ponto
                            </button>
                        </div>

                        <div className="space-y-3">
                            {destinos.map((destino, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
                                        {index + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={destino}
                                        onChange={(e) => updateDestino(index, e.target.value)}
                                        placeholder={`Ex: Ponto de Controlo ${index + 1} - Hub Logístico`}
                                        className="flex-1"
                                        required
                                    />
                                    {destinos.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDestino(index)}
                                            className="btn-icon"
                                            style={{ color: "var(--color-danger)" }}
                                            title="Remover ponto"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Hidden JSON representation for form submission */}
                        <input type="hidden" name="destinos" value={JSON.stringify(destinos.filter(d => d.trim() !== ""))} />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="btn-primary" disabled={isSubmitting || !selectedProduct}>
                            <FiSave /> {isSubmitting ? "A Guardar..." : "Guardar Planeamento"}
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
