import { supabase } from "@/utils/supabase";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

const useChapterDelete = (slug?: string, success?: Function) => {
  return useMutation(
    async (slugParams: string) => {
      try {
        // await supabase
        //   .from("images_detected")
        //   .delete()
        //   .match({ slug: slug ? slug : slugParams });
        await supabase
          .from("kaguya_chapters")
          .delete()
          .match({ slug: slug ? slug : slugParams });
      } catch (error) {
        throw new Error(error.message);
      }
    },
    {
      onSuccess: () => {
        success?.();
        toast.success("Chapter deleted successfully");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }
  );
};

export default useChapterDelete;
