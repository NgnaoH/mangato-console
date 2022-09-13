import { supabase } from "@/utils/supabase";
import { useQuery } from "react-query";

const useUploadedEpisode = (episodeSlug: string) => {
  return useQuery(["uploaded-episode", episodeSlug], async () => {
    // @ts-ignore
    const { data } = await supabase
      .from("kaguya_episodes")
      .select(
        `
            *,
            video:kaguya_videos(*)
        `
      )
      .eq("slug", episodeSlug)
      .single();

    return data;
  });
};

export default useUploadedEpisode;
