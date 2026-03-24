import { NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerActionClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email ?? "";
    const domain = email.split("@")[1] ?? "";

    const { data: match } = await supabase
      .from("allowed_signup_domains")
      .select("id")
      .eq("apex_domain", domain)
      .maybeSingle();

    if (!match) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/sign-in?error=unauthorized_domain`);
    }
  }

  return NextResponse.redirect(`${origin}/home`);
}
