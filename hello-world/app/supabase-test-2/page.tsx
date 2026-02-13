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
    <main style={{ padding: 24 }}>
      <h1>Examples</h1>

      <ul>
        {data?.map((row, i) => (
          <li key={i}>{row.example}</li>
        ))}
      </ul>
    </main>
  );
}