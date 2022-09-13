import Storage from "@/utils/storage";
import { supabase, useSupabaseSingleQuery } from "@/utils/supabase";
import useUser from "./useUser";

const useSavedWatched = (animeId: number) => {
  const { user } = useUser();
  const storage = new Storage("watched");

  const localStorageData =
    typeof window !== "undefined" && storage.findOne({ anime_id: animeId });

  return useSupabaseSingleQuery(
    ["watched", animeId],
    () =>
      supabase
        .from("kaguya_watched")
        .select("episode:episodeId(*), watchedTime")
        .eq("mediaId", animeId)
        .eq("userId", user.id)
        .limit(1)
        .single(),
    {
      enabled: !!user,
      initialData: localStorageData,
      refetchOnMount: true,
    }
  );
};

export default useSavedWatched;
