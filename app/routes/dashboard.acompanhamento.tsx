import { useLoaderData, Link } from "react-router";
import { FiActivity, FiSearch, FiExternalLink, FiHash } from "react-icons/fi";
import { supabase } from "~/lib/supabase.server";
import { HashDisplay } from "~/components/HashDisplay";

export function meta() {
    return [{ title: "Acompanhamento Geral — ChainTrack" }];
}

export async function loader() {
    // Buscar todos os produtos ordenados pelos atualizados mais recentemente
    const { data: produtos, error } = await supabase
        .from("produtos")
        .select(`
      id,
      codigo,
      nome,
      origem,
      destinos_planeados,
      estado_atual,
      hash_rastreio,
      updated_at
        `)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Erro a buscar produtos", error);
    }

    return { produtos: produtos || [] };
}

export default function AcompanhamentoPage() {
    const { produtos } = useLoaderData<typeof loader>();

    // Helper para determinar a cor do badge de estado
    const getStateColor = (estado: string) => {
        const estadoLower = estado.toLowerCase();
        if (estadoLower.includes("entregue") || estadoLower.includes("concluído")) return "var(--color-success)";
        if (estadoLower.includes("trânsito") || estadoLower.includes("movimento")) return "var(--color-accent-light)";
        if (estadoLower.includes("registado") || estadoLower.includes("produção")) return "var(--color-warning)";
        return "var(--color-text-secondary)";
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiActivity style={{ color: "var(--color-accent-light)" }} /> Acompanhamento Global
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Visão geral em tempo real do status de todos os produtos na cadeia logística.
                    </p>
                </div>
            </div>

            <div className="card overflow-hidden" style={{ padding: 0 }}>
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
                    <div className="relative w-full max-w-sm">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou código..."
                            className="w-full pl-10 py-2 bg-[rgba(0,0,0,0.2)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
                        // Nota: A lógica de pesquisa real (filtragem) pode ser feita no frontend para resposta mais rápida, 
                        // vamos omitir o state local por agora e focar no layout pedido.
                        />
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)] hidden sm:block">
                        Total: <b>{produtos.length}</b> produtos ativos
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(255,255,255,0.02)" }}>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>CÓDIGO</th>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>NOME DO PRODUTO</th>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>STATUS ATUAL</th>
                                <th className="p-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>HASH DE RASTREIO</th>
                                <th className="p-4 font-medium text-right" style={{ color: "var(--color-text-secondary)" }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtos.map((produto) => (
                                <tr key={produto.id} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="p-4 font-mono text-xs">{produto.codigo}</td>
                                    <td className="p-4 font-medium">
                                        <Link to={`/dashboard/products/${produto.id}`} className="hover:text-[var(--color-accent-light)] transition-colors">
                                            {produto.nome}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className="badge"
                                            style={{
                                                background: "rgba(255,255,255,0.05)",
                                                color: getStateColor(produto.estado_atual)
                                            }}
                                        >
                                            <span className="w-2 h-2 rounded-full mr-2" style={{ background: getStateColor(produto.estado_atual) }}></span>
                                            {produto.estado_atual}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {/* Using the HashDisplay wrapper but made more compact for table format */}
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <FiHash className="shrink-0 text-[var(--color-accent)]" />
                                            <span className="font-mono text-xs text-[var(--color-accent-light)] truncate block" title={produto.hash_rastreio}>
                                                {produto.hash_rastreio}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/track/${produto.hash_rastreio}`}
                                                className="btn-icon"
                                                title="Ver no Rastreio Público"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <FiExternalLink size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {produtos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                                        Nenhum produto em rastreamento atualmente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
