import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Hello World!</h1>

      <Link
        href="/supabase-test-2"
        style={{
          padding: "10px 16px",
          background: "black",
          color: "white",
          borderRadius: 6,
          display: "inline-block",
          marginTop: 20
        }}
      >
        Go to rendered table
      </Link>

    </main>
  );
}