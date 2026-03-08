import { redirect } from "react-router";
import { supabase } from "~/lib/supabase.server";

export async function action() {
    await supabase.auth.signOut();
    return redirect("/");
}

export async function loader() {
    return redirect("/");
}
