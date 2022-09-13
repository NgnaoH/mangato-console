import { supabase } from "@/utils/supabase";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

const usePublishEpisode = (episodeSlug: string) => {
  return useMutation(
    async () => {
      const { error } = await supabase
        .from("kaguya_episodes")
        .update({ published: true })
        .match({ slug: episodeSlug });

      if (error) {
        throw error;
      }

      return true;
    },
    {
      onError: (error: Error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        toast.success("Publish episode successfully");
      },
    }
  );
};

export default usePublishEpisode;
