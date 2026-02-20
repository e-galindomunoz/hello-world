"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createSupabaseServerClient();

  // 1. Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to vote." };
  }

  // 2. Insert or Update the vote
  // We use upsert because the schema has a unique constraint on (profile_id, caption_id)
  const { error: upsertError } = await supabase
    .from("caption_votes")
    .upsert(
      {
        caption_id: captionId,
        profile_id: user.id,
        vote_value: voteValue,
        created_datetime_utc: new Date().toISOString(),
      },
      { onConflict: "profile_id,caption_id" }
    );

  if (upsertError) {
    console.error("Error submitting vote:", upsertError);
    return { error: upsertError.message };
  }

  revalidatePath("/captions");
  return { success: true };
}
