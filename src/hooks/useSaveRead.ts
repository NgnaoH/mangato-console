import { supabase } from "@/utils/supabase";
import { useMutation } from "react-query";
import useUser from "./useUser";

interface MutationInput {
  media_id: number;
  chapter_id: string;
}

const useSaveRead = () => {
  const { user } = useUser();

  return useMutation(async (data: MutationInput) => {
    if (!user) return;

    const { chapter_id, media_id } = data;

    const { error: upsertError } = await supabase.from("kaguya_read").upsert({
      mediaId: media_id,
      userId: user.id,
      chapterId: chapter_id,
    });

    if (upsertError) throw upsertError;

    return true;
  });
};

export default useSaveRead;
