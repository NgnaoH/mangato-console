import { Attachment, uploadFile } from "@/services/upload";
import { PostgrestError } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import useUser from "./useUser";

type ImageUpdate = {
  images: File[];
  lang: string;
};

const useUpdateImages = (chapterSlug: string) => {
  const id = "update-video-id";
  const client = useQueryClient();
  const router = useRouter();
  const { user } = useUser();

  return useMutation<Attachment[], PostgrestError, ImageUpdate>(
    async ({ images, lang }) => {
      if (!images?.length) {
        throw new Error("Images is required");
      }

      toast.loading("Uploading images...", { toastId: id });

      const uploadedImages = await uploadFile(images, undefined, {
        chapterSlug,
        userId: user.id,
        lang,
      });

      if (!uploadedImages?.length) {
        throw new Error("Upload images failed");
      }

      return uploadedImages;
    },
    {
      onError: (error) => {
        toast.update(id, {
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });

        toast.error(error.message, { autoClose: 3000 });
      },
      onSuccess: () => {
        toast.update(id, {
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        toast.success("Upload successfully", { autoClose: 3000 });

        router.push(`/upload/manga/${router.query?.id}`);
        client.invalidateQueries(["uploaded-chapter", chapterSlug]);
      },
    }
  );
};

export default useUpdateImages;
