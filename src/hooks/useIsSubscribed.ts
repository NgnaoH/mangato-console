import { Media } from "@/types/anilist";
import { supabase } from "@/utils/supabase";
import { useQuery } from "react-query";
import useUser from "./useUser";

const useIsSubscribed = <T extends "anime" | "manga">(
  type: T,
  source: Media
) => {
  const { user } = useUser();
  const tableName =
    type === "anime" ? "kaguya_anime_subscribers" : "kaguya_manga_subscribers";
  const queryKey = ["is_subscribed", user?.id, source.id];

  return useQuery(
    queryKey,
    async () => {

      const { data, error } = await supabase
        .from(tableName)
        .select("userId")
        .eq("userId", user.id)
        .eq("mediaId", source.id)
        .limit(1)
        .single();

      if (error) return false;

      return !!data;
    },
    { enabled: !!user }
  );
};

export default useIsSubscribed;
