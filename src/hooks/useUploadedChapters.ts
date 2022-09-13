import { supabase } from "@/utils/supabase";
import { useQuery, useQueryClient } from "react-query";

interface UseUploadedChaptersOptions {
  mediaId: number;
  sourceId: string;
}

const useUploadedChapters = ({
  mediaId,
  sourceId,
}: UseUploadedChaptersOptions) => {
  const queryClient = useQueryClient();

  return useQuery(
    ["uploaded-chapters", { mediaId, sourceId }],
    async () => {
      // @ts-ignore
      const { data, error }: any = await supabase
        .from("kaguya_manga_source")
        .select(
          `
            mediaId,
            chapters:kaguya_chapters(
                *,
                images:kaguya_images(*)
            )
        `
        )
        .eq("sourceId", sourceId)
        .eq("mediaId", mediaId)
        .single();

      if (error) {
        return [];
      }

      return data?.chapters || [];
    },
    {
      onSuccess(data) {
        data.forEach((chapter) => {
          queryClient.setQueryData(["uploaded-chapter", chapter.slug], chapter);
        });
      },
      refetchOnMount: true,
    }
  );
};

export default useUploadedChapters;
