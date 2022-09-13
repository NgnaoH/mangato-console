import { AnimeSourceConnection } from "@/types";
import { sortMediaUnit } from "@/utils/data";
import { supabase } from "@/utils/supabase";
import { useQuery } from "react-query";

const query = `
  *,
  episodes:kaguya_episodes(
      *,
      source:kaguya_sources(
          *
      )
  )
`;

const useEpisodes = (mediaId: number) => {
  return useQuery(["episodes", mediaId], async () => {
    // @ts-ignore
    const { data, error } = await supabase
      .from("kaguya_anime_source")
      .select(query)
      .eq("mediaId", mediaId);

    if (error) throw error;

    const episodes = data?.flatMap((connection: AnimeSourceConnection) => connection.episodes);

    const sortedEpisodes = sortMediaUnit(
      episodes.filter((episode) => episode.published)
    );

    return sortedEpisodes;
  });
};

export default useEpisodes;
