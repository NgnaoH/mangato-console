import { supabase, useSupabaseSingleQuery } from "@/utils/supabase";
import useUser from "./useUser";

const useSavedRead = (mangaId: number) => {
  const { user } = useUser();

  return useSupabaseSingleQuery(
    ["read", mangaId],
    () =>
      supabase
        .from("kaguya_read")
        .select("chapter:chapterId(*)")
        .eq("mediaId", mangaId)
        .eq("userId", user.id)
        .limit(1)
        .single(),
    {
      enabled: !!user,
      retry: 0,
    }
  );
};

export default useSavedRead;
