import { useLoaderData } from "react-router";
import { FiBox, FiUsers, FiActivity, FiTrendingUp } from "react-icons/fi";
import { StatsCard } from "~/components/StatsCard";
import { supabase } from "~/lib/supabase.server";
import type { Route } from "./+types/dashboard._index";

export function meta() {
    return [{ title: "Dashboard — ChainTrack" }];
}

export async function loader({ }: Route.LoaderArgs) {
    const [produtosRes, usersRes, eventsRes] = await Promise.all([
        supabase.from("produtos").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tracking_events").select("*", { count: "exact", head: true }),
    ]);

    const recentProducts = await supabase
        .from("produtos")
        .select("id, codigo, nome, estado_atual, hash_rastreio, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        totalProdutos: produtosRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalEvents: eventsRes.count || 0,
        recentProducts: recentProducts.data || [],
    };
}

function getStatusBadge(estado: string) {
    const s = estado.toLowerCase();
    if (s.includes("entregue") || s.includes("concluído")) return "badge-success";
    if (s.includes("trânsito") || s.includes("transporte")) return "badge-warning";
    if (s.includes("devolvido") || s.includes("cancelado")) return "badge-danger";
    return "badge-info";
}

export default function DashboardIndex() {
    const { totalProdutos, totalUsers, totalEvents, recentProducts } = useLoaderData<typeof loader>();

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Visão geral da cadeia de abastecimento
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={FiBox} label="Total de Produtos" value={totalProdutos} change="12%" positive />
                <StatsCard icon={FiUsers} label="Utilizadores" value={totalUsers} />
                <StatsCard icon={FiActivity} label="Eventos de Rastreio" value={totalEvents} change="8%" positive />
                <StatsCard icon={FiTrendingUp} label="Taxa de Entrega" value="94%" change="3%" positive />
            </div>

            {/* Recent products */}
            <div className="card">
                <h2 className="text-lg font-bold mb-4">Produtos Recentes</h2>
                {recentProducts.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Nenhum produto registado ainda. Comece a adicionar produtos!
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>Estado</th>
                                    <th>Hash</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProducts.map((p: any) => (
                                    <tr key={p.id}>
                                        <td className="font-medium" style={{ color: "var(--color-text-primary)" }}>{p.codigo}</td>
                                        <td>{p.nome}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(p.estado_atual)}`}>
                                                {p.estado_atual}
                                            </span>
                                        </td>
                                        <td>
                                            <code className="hash-display text-xs">
                                                {p.hash_rastreio?.slice(0, 12)}...
                                            </code>
                                        </td>
                                        <td className="text-xs">{new Date(p.created_at).toLocaleDateString("pt-PT")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
