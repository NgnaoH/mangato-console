import { useQuery } from "react-query";
import { getMedia } from "@/services/anilist";
import { Media, MediaType } from "@/types/anilist";
import { isMobile } from "react-device-detect";
import useUser from "./useUser";
import { supabase } from "@/utils/supabase";
import { Read } from "@/types";

const useRead = () => {
  const { user } = useUser();

  return useQuery(
    "read",
    async () => {
      // @ts-ignore
      const { data, error } = await supabase
        .from("kaguya_read")
        .select(
          "mediaId, chapter:kaguya_chapters!chapterId(sourceChapterId, name, sourceId)"
        )
        .eq("userId", user.id)
        .order("updated_at", { ascending: false })
        .limit(isMobile ? 5 : 10);

      if (error) throw error;

      const anilistMedia: Array<Media> = await getMedia({
        id_in: data.map((read: any) => read.mediaId),
        type: MediaType.Manga,
      });

      return data.map((read) => {
        const media = anilistMedia.find((media) => media.id === read.mediaId);

        return {
          ...read,
          media,
        };
      });
    },
    { enabled: !!user }
  );
};

export default useRead;
