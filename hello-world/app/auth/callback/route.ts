import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const response = NextResponse.redirect(`${origin}/home`);

  if (code) {
    const supabase = createSupabaseRouteHandlerClient(request, (name, value, options) => {
      response.cookies.set(name, value, options);
    });

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

  return response;
}
