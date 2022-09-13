import { Chapter } from "@/types";
import { supabase } from "@/utils/supabase";
import { useQuery } from "react-query";

const useUploadedChapter = (chapterSlug: string) => {
  return useQuery<Chapter>(["uploaded-chapter", chapterSlug], async () => {
    // @ts-ignore
    const { data, error } = await supabase
      .from("kaguya_chapters")
      .select(
        `
            *,
            images:kaguya_images(*)
        `
      )
      .eq("slug", chapterSlug)
      .single();

    if (error) {
      return null;
    }

    return data;
  });
};

export default useUploadedChapter;
