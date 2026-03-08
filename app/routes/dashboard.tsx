import { Outlet, useLoaderData } from "react-router";
import { Sidebar } from "~/components/Sidebar";
import { supabase } from "~/lib/supabase.server";
import type { Route } from "./+types/dashboard";

export async function loader({ }: Route.LoaderArgs) {
    const { data: { user } } = await supabase.auth.getUser();
    return { userEmail: user?.email || "" };
}

export default function DashboardLayout() {
    const { userEmail } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
            <Sidebar userEmail={userEmail} />
            <main className="lg:ml-64 p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
}
