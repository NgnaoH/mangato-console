import { Episode } from "@/types";
import { supabase } from "@/utils/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";

export const useUpdateEpisode = (episodeSlug: string) => {
  const client = useQueryClient();

  return useMutation<Episode[], PostgrestError, Partial<Episode>>(
    async (updateValue) => {
      const { data, error } = await supabase
        .from("kaguya_episodes")
        .update(updateValue)
        .match({ slug: episodeSlug });

      if (error) throw error;

      return data;
    },
    {
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        toast.success("Episode updated");

        client.invalidateQueries(["uploaded-episode", episodeSlug]);
      },
    }
  );
};
