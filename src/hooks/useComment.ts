import { supabase, useSupabaseSingleQuery } from "@/utils/supabase";

const useComment = (commentId: string) => {
  return useSupabaseSingleQuery(
    ["comment", commentId],
    () =>
      // @ts-ignore
      supabase
        .from("sce_comments_with_metadata")
        .select(
          "*,user:sce_display_users!user_id(*),reactions_metadata:sce_comment_reactions_metadata(*)"
        )
        .eq("id", commentId)
        .single(),
    { staleTime: Infinity }
  );
};

export default useComment;
