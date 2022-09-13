import { supabase } from "@/utils/supabase";
import { AxiosError } from "axios";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

const useMangaSourceDelete = (sourceMediaId: string) => {
  return useMutation(
    async () => {
      const { error } = await supabase
        .from("kaguya_manga_source")
        .delete()
        .match({ sourceMediaId });

      if (error) {
        throw new Error(error.message);
      }
    },
    {
      onSuccess: () => {
        toast.success("Manga source deleted successfully");
      },
      onError: (error: AxiosError) => {
        toast.error(error.message);
      },
    }
  );
};

export default useMangaSourceDelete;
