import { Link } from "react-router";
import { FiBox, FiShield, FiActivity, FiArrowRight, FiHash, FiGlobe } from "react-icons/fi";

export function meta() {
    return [
        { title: "ChainTrack — Supply Chain Blockchain Tracker" },
        { name: "description", content: "Plataforma de rastreio de produtos com tecnologia blockchain. Rastreie toda a cadeia logística com hashes imutáveis e QR codes." },
    ];
}

const features = [
    {
        icon: FiHash,
        title: "Hash Imutável",
        desc: "Cada produto recebe uma hash SHA-256 única, garantindo integridade e rastreabilidade.",
    },
    {
        icon: FiActivity,
        title: "Rastreio em Tempo Real",
        desc: "Acompanhe cada etapa da cadeia logística com atualizações via QR code.",
    },
    {
        icon: FiShield,
        title: "Segurança Blockchain",
        desc: "Inspirado em contratos inteligentes Solidity para máxima confiabilidade.",
    },
    {
        icon: FiGlobe,
        title: "Acesso Global",
        desc: "Consulte o rastreio de qualquer produto de qualquer lugar, sem login.",
    },
];

export default function LandingPage() {
    return (
        <div style={{ background: "var(--color-bg-primary)" }}>
            {/* Navbar */}
            <nav
                className="fixed top-0 w-full z-50 glass px-6 py-4 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center animate-pulse-glow"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}
                    >
                        <FiBox size={18} color="white" />
                    </div>
                    <span className="text-lg font-bold gradient-text">ChainTrack</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/auth/login" className="btn-secondary text-sm">
                        Entrar
                    </Link>
                    <Link to="/auth/register" className="btn-primary text-sm">
                        Começar Agora
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
                        style={{ background: "var(--color-accent-light)" }}
                    />
                    <div
                        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl"
                        style={{ background: "var(--color-accent)" }}
                    />
                </div>

                <div className="text-center max-w-3xl relative z-10">
                    <div className="badge badge-success mb-6 text-sm">
                        ⛓️ Powered by Blockchain Technology
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                        Rastreie toda a{" "}
                        <span className="gradient-text">cadeia logística</span>
                    </h1>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                        Plataforma de supply chain com hashes imutáveis, QR codes inteligentes
                        e rastreio transparente de ponta a ponta.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/auth/register" className="btn-primary text-base px-8 py-4">
                            Criar Conta Grátis <FiArrowRight />
                        </Link>
                        <Link to="/track/demo" className="btn-secondary text-base px-8 py-4">
                            Ver Demo de Rastreio
                        </Link>
                    </div>

                    {/* Hash visualization */}
                    <div className="mt-16 animate-fade-in">
                        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
                            Exemplo de hash de rastreio:
                        </p>
                        <code className="hash-display text-sm px-6 py-3 inline-block">
                            0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                        </code>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">
                        Porque <span className="gradient-text">ChainTrack</span>?
                    </h2>
                    <p className="text-center mb-16" style={{ color: "var(--color-text-secondary)" }}>
                        Tecnologia de ponta para gestão completa da supply chain
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="card group cursor-default">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: "rgba(0, 204, 102, 0.1)" }}
                                    >
                                        <f.icon size={22} style={{ color: "var(--color-accent-light)" }} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div
                    className="max-w-3xl mx-auto text-center p-12 rounded-3xl"
                    style={{
                        background: "linear-gradient(135deg, var(--color-accent-dark), var(--color-bg-card))",
                        border: "1px solid var(--color-accent)",
                    }}
                >
                    <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
                    <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
                        Crie a sua conta e comece a rastrear os seus produtos hoje mesmo.
                    </p>
                    <Link to="/auth/register" className="btn-primary text-base px-8 py-4">
                        Começar Agora <FiArrowRight />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="py-8 px-6 text-center text-xs"
                style={{ color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)" }}
            >
                <p>© 2026 ChainTrack — Supply Chain Blockchain Tracker. Built with ❤️</p>
            </footer>
        </div>
    );
}
