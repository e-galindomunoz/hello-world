export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "../SignOutButton";
import Link from "next/link";
import VoteButtons from "./VoteButtons";
import { redirect } from "next/navigation";

export default async function CaptionsPage() {
  const jade = "#00A86B";
  const supabase = await createSupabaseServerClient();

  // Get user session
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) redirect("/");

  // Fetch current user's votes if logged in
  let userVotes: Record<string, number> = {};

  let votedCount = 0;
  if (user) {
    const { data: votesData } = await supabase
      .from("caption_votes")
      .select("caption_id, vote_value")
      .eq("profile_id", user.id);
    
    if (votesData) {
      votedCount = votesData.length;
      userVotes = votesData.reduce((acc: any, vote: any) => {
        acc[vote.caption_id] = vote.vote_value;
        return acc;
      }, {});
    }
  }

  // 1. Fetch ALL available IDs (even if already voted on, to keep it continuous)
  const { data: availableIds } = await supabase
    .from("captions")
    .select("id")
    .neq("content", "")
    .not("content", "is", null);

  // 2. Pick a random ID from the list
  let randomId = null;
  if (availableIds && availableIds.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableIds.length);
    randomId = availableIds[randomIndex].id;
  }
  const totalAvailable = availableIds?.length || 0;
  const captionsLeft = Math.max(totalAvailable - votedCount, 0);

  // 3. Fetch the full data for that specific random ID AND its vote counts
  let captions: any[] = [];
  let captionsError = null;
  let upvoteCount = 0;
  let downvoteCount = 0;

  if (randomId) {
    // Fetch caption details
    const { data, error } = await supabase
      .from("captions")
      .select("id, content, like_count, images!inner(url)")
      .eq("id", randomId)
      .limit(1);
    
    captions = data || [];
    captionsError = error;

    if (captions.length > 0) {
      // Fetch upvote and downvote totals for this caption
      const { data: votesForCaption } = await supabase
        .from("caption_votes")
        .select("vote_value")
        .eq("caption_id", randomId);

      if (votesForCaption) {
        upvoteCount = votesForCaption.filter((v: any) => v.vote_value === 1).length;
        downvoteCount = votesForCaption.filter((v: any) => v.vote_value === -1).length;
      }
    }
  }

  if (captionsError) {
    return (
      <main style={{ padding: 24, color: jade, background: "#000", minHeight: "100vh" }}>
        <h1>Error</h1>
        <p>{captionsError.message}</p>
        <Link href="/" style={{ color: jade }}>Go Back</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        paddingTop: 60,
        color: jade,
      }}
    >
      <div
        style={{
          background: "#000",
          padding: 24,
          borderRadius: 12,
          width: 600,
          border: `1px solid ${jade}`,
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
              Enjoy random captions!
            </p>
            <p style={{ margin: "6px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
              Captions left: {captionsLeft}
            </p>
          </div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", opacity: 0.7 }}>{user.email}</span>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/" style={{ color: jade, textDecoration: "none" }}>Sign In to Vote</Link>
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
                    background: "#000",
                    borderRadius: "12px",
                    border: `1px solid ${jade}`,
                  }}
                >
                  {caption.images?.url && (
                    <img 
                      src={caption.images.url} 
                      alt="Caption Image" 
                      style={{ 
                        width: "100%", 
                        borderRadius: "8px", 
                        marginBottom: "16px",
                        display: "block",
                        aspectRatio: "1/1",
                        objectFit: "cover"
                      }} 
                    />
                  )}
                  <p style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "500", textAlign: "center", color: jade }}>
                    "{caption.content}"
                  </p>
                  
                  {user && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <VoteButtons
                        captionId={caption.id}
                        initialLikeCount={caption.like_count || 0}
                        userVote={userVoteValue}
                        upvotes={upvoteCount}
                        downvotes={downvoteCount}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : null}
        </div>
      </div>
    </main>
  );
}
