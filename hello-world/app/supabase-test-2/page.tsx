export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function ExamplesPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("terms")
    .select("example");

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
        }}
      >
        <h1 style={{ marginBottom: 16 }}>Examples</h1>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
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
                <td style={{ padding: "8px 0", opacity: 0.7 }}>
                  {i + 1}
                </td>
                <td style={{ padding: "8px 0" }}>
                  {row.example}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}