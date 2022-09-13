import { SourceStatus } from "@/types";
import { Media } from "@/types/anilist";
import { supabase, useSupabaseSingleQuery } from "@/utils/supabase";
import useUser from "./useUser";

const useSourceStatus = <T extends "anime" | "manga">(
  type: T,
  source: Media
) => {
  const tableName =
    type === "anime" ? "kaguya_watch_status" : "kaguya_read_status";
  const queryKey = [tableName, source.id];
  const { user } = useUser();

  return useSupabaseSingleQuery<SourceStatus<T>>(
    queryKey,
    () => {
      return supabase
        .from(tableName)
        .select("*")
        .eq("userId", user.id)
        .eq("mediaId", source.id)
        .limit(1)
        .single();
    },
    { enabled: !!user }
  );
};

export default useSourceStatus;
