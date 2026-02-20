export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "../SignOutButton";
import Link from "next/link";
import VoteButtons from "./VoteButtons";
import { redirect } from "next/navigation";

export default async function CaptionsPage() {
  const jade = "#00D48A";
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

  // 1. Fetch all caption IDs that have images
  const { data: allIds, error: allIdsError } = await supabase
    .from("captions")
    .select("id")
    .not("images", "is", null);

  if (allIdsError) {
    return (
      <main style={{ padding: 24, color: jade, background: "#000", minHeight: "100vh" }}>
        <h1>Error</h1>
        <p>{allIdsError.message}</p>
        <Link href="/" style={{ color: jade }}>Go Back</Link>
      </main>
    );
  }

  // 2. Pick a random ID from the list
  let randomId = null;
  if (allIds && allIds.length > 0) {
    const randomIndex = Math.floor(Math.random() * allIds.length);
    randomId = allIds[randomIndex].id;
  }

  // 3. Fetch caption AND its vote counts
  let captions: any[] = [];
  let captionsError = null;
  const voteCounts: Record<string, { up: number; down: number }> = {};

  if (randomId) {
    // Fetch caption details
    const { data, error } = await supabase
      .from("captions")
      .select("id, content, like_count, images(url)")
      .eq("id", randomId)
      .limit(1);
    
    captions = data || [];
    captionsError = error;

    if (captions.length > 0) {
      // Fetch upvote and downvote totals for this caption
      const { data: votesForCaptions } = await supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .eq("caption_id", randomId);

      if (votesForCaptions) {
        for (const vote of votesForCaptions) {
          const captionId = vote.caption_id as string;
          if (!voteCounts[captionId]) {
            voteCounts[captionId] = { up: 0, down: 0 };
          }
          if (vote.vote_value === 1) voteCounts[captionId].up += 1;
          if (vote.vote_value === -1) voteCounts[captionId].down += 1;
        }
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
              const counts = voteCounts[caption.id] || { up: 0, down: 0 };

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
                        upvotes={counts.up}
                        downvotes={counts.down}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "20px", marginBottom: "8px", color: jade }}>
                No captions are available right now.
              </p>
              <p style={{ opacity: 0.7 }}>Check back later for more captions.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
