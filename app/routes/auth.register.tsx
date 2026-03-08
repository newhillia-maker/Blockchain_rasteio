import { Form, Link, redirect, useActionData } from "react-router";
import { FiBox, FiMail, FiLock, FiUser } from "react-icons/fi";
import { supabase } from "~/lib/supabase.client";
import type { Route } from "./+types/auth.register";

export function meta() {
    return [{ title: "Criar Conta — ChainTrack" }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!nome || !email || !password) {
        return { error: "Preencha todos os campos." };
    }

    if (password.length < 6) {
        return { error: "A password deve ter pelo menos 6 caracteres." };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } },
    });

    if (error) {
        return { error: error.message };
    }

    return redirect("/dashboard");
}

export default function RegisterPage() {
    const actionData = useActionData<{ error?: string }>();

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ background: "var(--color-bg-primary)" }}
        >
            <div className="w-full max-w-md">
                <div className="flex items-center gap-3 justify-center mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse-glow"
                        style={{
                            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                        }}
                    >
                        <FiBox size={24} color="white" />
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">ChainTrack</h1>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold text-center mb-2">Criar conta</h2>
                    <p className="text-sm text-center mb-6" style={{ color: "var(--color-text-secondary)" }}>
                        Comece a rastrear os seus produtos
                    </p>

                    {actionData?.error && (
                        <div
                            className="mb-4 px-4 py-3 rounded-xl text-sm"
                            style={{ background: "rgba(231,76,60,0.1)", color: "var(--color-danger)", border: "1px solid rgba(231,76,60,0.2)" }}
                        >
                            {actionData.error}
                        </div>
                    )}

                    <Form method="post" className="space-y-4">
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Nome
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--color-text-muted)" }} />
                                <input name="nome" type="text" placeholder="Seu nome" required style={{ paddingLeft: "2.5rem" }} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Email
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--color-text-muted)" }} />
                                <input name="email" type="email" placeholder="seu@email.com" required style={{ paddingLeft: "2.5rem" }} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--color-text-muted)" }} />
                                <input name="password" type="password" placeholder="Mínimo 6 caracteres" required style={{ paddingLeft: "2.5rem" }} />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full justify-center py-3">
                            Criar Conta
                        </button>
                    </Form>

                    <p className="text-sm text-center mt-6" style={{ color: "var(--color-text-secondary)" }}>
                        Já tem conta?{" "}
                        <Link to="/auth/login" className="font-medium">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
