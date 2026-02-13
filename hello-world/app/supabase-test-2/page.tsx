export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "../SignOutButton";

export default async function ExamplesPage() {
  const supabase = await createSupabaseServerClient();

  // ✅ Protect page
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect("/");

  const { data, error } = await supabase.from("terms").select("example");

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f10",
        display: "flex",
        justifyContent: "center",
        paddingTop: 60,
      }}
    >
      <div
        style={{
          background: "#1c1c1f",
          padding: 24,
          borderRadius: 12,
          width: 500,
          color: "white",
        }}
      >
        {/* ✅ Header row with logout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h1 style={{ margin: 0 }}>Examples</h1>
          <SignOutButton />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #444",
                  paddingBottom: 8,
                }}
              >
                #
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #444",
                  paddingBottom: 8,
                }}
              >
                Example
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: "8px 0", opacity: 0.7 }}>{i + 1}</td>
                <td style={{ padding: "8px 0" }}>{row.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}