import { supabase } from "@/utils/supabase";
import { useMutation } from "react-query";
import useUser from "./useUser";

interface MutationInput {
  media_id: number;
  episode_id: string;
  watched_time?: number;
}

const useSaveWatched = () => {
  const { user } = useUser();

  return useMutation(async (data: MutationInput) => {
    if (!user) return;

    const { episode_id, media_id, watched_time } = data;

    const { error: upsertError } = await supabase
      .from("kaguya_watched")
      .upsert({
        mediaId: media_id,
        episodeId: episode_id,
        userId: user.id,
        watchedTime: watched_time,
      });

    if (upsertError) throw upsertError;

    return true;
  });
};

export default useSaveWatched;
