"use server";

import { createSupabaseServerActionClient } from "@/lib/supabaseServer";

export async function submitVote(captionId: string, voteValue: number) {
  try {
    const supabase = await createSupabaseServerActionClient();

    // 1. Check authentication (session read from cookie, no network call)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { error: "You must be logged in to vote." };
    }

    // 2. Insert or Update the vote
    const { error: upsertError } = await supabase
      .from("caption_votes")
      .upsert(
        {
          caption_id: captionId,
          profile_id: session.user.id,
          vote_value: voteValue,
          created_datetime_utc: new Date().toISOString(),
        },
        { onConflict: "profile_id,caption_id" }
      );

    if (upsertError) {
      console.error("Error submitting vote:", upsertError);
      return { error: upsertError.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Critical error in submitVote:", err);
    return { error: "Internal server error during voting." };
  }
}

export async function getRandomCaptions(limit: number = 5) {
  const start = Date.now();

  try {
    const supabase = await createSupabaseServerActionClient();

    // Session from cookie — no network call
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    // 1. Parallelize: fetch caption ID pool + user's already-voted IDs
    const [idRes, votedRes] = await Promise.all([
      supabase.from("captions").select("id").limit(200),
      userId
        ? supabase.from("caption_votes").select("caption_id").eq("profile_id", userId)
        : Promise.resolve({ data: [] }),
    ]);

    if (idRes.error || !idRes.data || idRes.data.length === 0) {
      return [];
    }

    const votedIds = new Set((votedRes.data ?? []).map((v: { caption_id: string }) => v.caption_id));
    const unvoted = idRes.data.filter(d => !votedIds.has(d.id));

    if (unvoted.length === 0) return [];

    const selectedIds = [...unvoted]
      .sort(() => 0.5 - Math.random())
      .slice(0, limit)
      .map(d => d.id);

    // 2. Parallelize: fetch caption details + vote counts
    const [captionsRes, voteCountsRes] = await Promise.all([
      supabase
        .from("captions")
        .select("id, content, images (url)")
        .in("id", selectedIds),
      supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .in("caption_id", selectedIds),
    ]);

    const { data: captions, error: fetchError } = captionsRes;
    if (fetchError || !captions) {
      console.error("Error fetching captions:", fetchError);
      return [];
    }

    const voteCounts = voteCountsRes.data ?? [];

    const processed = captions.map(cap => {
      const votes = voteCounts.filter(v => v.caption_id === cap.id);
      return {
        ...cap,
        images: Array.isArray(cap.images) ? cap.images[0] : cap.images,
        upvotes: votes.filter(v => v.vote_value === 1).length,
        downvotes: votes.filter(v => v.vote_value === -1).length,
        userVote: undefined,
      };
    });

    const withImages = processed.filter(cap => cap.images?.url);
    console.log(`[getRandomCaptions] Finished in ${Date.now() - start}ms`);
    return withImages;
  } catch (err) {
    console.error("Critical error in getRandomCaptions:", err);
    return [];
  }
}
