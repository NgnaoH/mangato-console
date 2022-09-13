import { supabase } from "@/utils/supabase";
import { useQuery, useQueryClient } from "react-query";

interface UseUploadedEpisodesOptions {
  mediaId: number;
  sourceId: string;
}

const useUploadedEpisodes = ({
  mediaId,
  sourceId,
}: UseUploadedEpisodesOptions) => {
  const queryClient = useQueryClient();

  return useQuery(
    ["uploaded-episodes", { mediaId, sourceId }],
    async () => {
      // @ts-ignore
      const { data, error }: any = await supabase
        .from("kaguya_anime_source")
        .select(
          `
            mediaId,
            episodes:kaguya_episodes(
                *,
                video:kaguya_videos(*)
            )
        `
        )
        .eq("sourceId", sourceId)
        .eq("mediaId", mediaId)
        .single();

      if (error) {
        return [];
      }

      return data?.episodes || [];
    },
    {
      onSuccess(data) {
        data.forEach((episode) => {
          queryClient.setQueryData(["uploaded-episode", episode.slug], episode);
        });
      },
      refetchOnMount: true,
    }
  );
};

export default useUploadedEpisodes;
