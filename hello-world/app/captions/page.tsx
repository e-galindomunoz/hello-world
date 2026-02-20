export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "../SignOutButton";
import Link from "next/link";
import VoteButtons from "./VoteButtons";
import { redirect } from "next/navigation";

export default async function CaptionsPage() {
  const supabase = await createSupabaseServerClient();

  // Get user session
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) redirect("/");

  // Fetch current user's votes if logged in
  let userVotes: Record<string, number> = {};
  let totalVotesCount = 0;

  if (user) {
    const { data: votesData } = await supabase
      .from("caption_votes")
      .select("caption_id, vote_value")
      .eq("profile_id", user.id);
    
    if (votesData) {
      totalVotesCount = votesData.length;
      userVotes = votesData.reduce((acc: any, vote: any) => {
        acc[vote.caption_id] = vote.vote_value;
        return acc;
      }, {});
    }
  }

  // Get IDs of captions already voted on
  const votedCaptionIds = Object.keys(userVotes);

  // Fetch ONE caption that the user HAS NOT voted on yet
  let query = supabase
    .from("captions")
    .select("id, content, like_count, images!inner(url)")
    .neq("content", "")
    .not("content", "is", null);

  if (votedCaptionIds.length > 0) {
    query = query.not("id", "in", `(${votedCaptionIds.join(",")})`);
  }

  const { data: captions, error: captionsError } = await query
    .order("created_datetime_utc", { ascending: false })
    .limit(1);

  if (captionsError) {
    return (
      <main style={{ padding: 24, color: "white", background: "#0f0f10", minHeight: "100vh" }}>
        <h1>Error</h1>
        <p>{captionsError.message}</p>
        <Link href="/" style={{ color: "#3b82f6" }}>Go Back</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f10",
        display: "flex",
        justifyContent: "center",
        paddingTop: 60,
        color: "white",
      }}
    >
      <div
        style={{
          background: "#1c1c1f",
          padding: 24,
          borderRadius: 12,
          width: 600,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Rate Captions</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.6 }}>
              Total Voted: {totalVotesCount}
            </p>
          </div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", opacity: 0.7 }}>{user.email}</span>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/" style={{ color: "#3b82f6", textDecoration: "none" }}>Sign In to Vote</Link>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {captions && captions.length > 0 ? (
            captions.map((caption: any) => {
              const userVoteValue = userVotes[caption.id];

              return (
                <div
                  key={caption.id}
                  style={{
                    padding: "16px",
                    background: "#2a2a2e",
                    borderRadius: "8px",
                    border: "1px solid #333",
                  }}
                >
                  {caption.images?.url && (
                    <img 
                      src={caption.images.url} 
                      alt="Caption Image" 
                      style={{ 
                        width: "100%", 
                        borderRadius: "4px", 
                        marginBottom: "12px",
                        display: "block"
                      }} 
                    />
                  )}
                  <p style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
                    {caption.content}
                  </p>
                  
                  {user ? (
                    <VoteButtons
                      captionId={caption.id}
                      initialLikeCount={caption.like_count || 0}
                      userVote={userVoteValue}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.6 }}>
                      <span style={{ fontWeight: "bold" }}>{caption.like_count || 0}</span>
                      <span style={{ fontSize: "14px" }}>likes</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "20px", marginBottom: "8px" }}>🎉 All caught up!</p>
              <p style={{ opacity: 0.5 }}>You've voted on all available captions.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
