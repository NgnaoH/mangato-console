import { getMedia } from "@/services/anilist";
import { useQuery } from "react-query";
import { isMobile } from "react-device-detect";
import useUser from "./useUser";
import { supabase } from "@/utils/supabase";
import { Media } from "@/types/anilist";
import { Watched } from "@/types";

const useWatched = () => {
  const { user } = useUser();

  return useQuery(
    "watched",
    async () => {
      // @ts-ignore
      const { data } = await supabase
        .from("kaguya_watched")
        .select(
          "mediaId, episode:kaguya_episodes!episodeId(sourceEpisodeId, name, sourceId)"
        )
        .eq("userId", user.id)
        .order("updated_at", { ascending: false })
        .limit(isMobile ? 5 : 10);

      const anilistMedia: Array<Media> = await getMedia({
        id_in: data.map((watched: any) => watched.mediaId),
      });

      return data.map((watched) => {
        const media = anilistMedia.find(
          (media) => media.id === watched.mediaId
        );

        return {
          ...watched,
          media,
        };
      });
    },
    { enabled: !!user }
  );
};

export default useWatched;
