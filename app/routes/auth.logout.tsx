import { redirect } from "react-router";
import { supabase } from "~/lib/supabase.client";

export async function clientAction() {
    await supabase.auth.signOut();
    return redirect("/");
}

export async function clientLoader() {
    return redirect("/");
}
