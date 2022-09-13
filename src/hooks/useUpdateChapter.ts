import { Chapter } from "@/types";
import { supabase } from "@/utils/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";

const useUpdateChapter = (chapterSlug: string) => {
  const client = useQueryClient();

  return useMutation<Chapter[], PostgrestError, Partial<Chapter>>(
    async (updateValue) => {
      const { data, error } = await supabase
        .from("kaguya_chapters")
        .update(updateValue)
        .match({ slug: chapterSlug });

      if (error) throw error;

      return data;
    },
    {
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        toast.success("Chapter updated");

        client.invalidateQueries(["uploaded-chapter", chapterSlug]);
      },
    }
  );
};

export default useUpdateChapter;
