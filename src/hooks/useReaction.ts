import { supabase, useSupabaseSingleQuery } from "@/utils/supabase";

const useReaction = (type: string) => {
  return useSupabaseSingleQuery(
    ["reaction", type],
    () => {
      return supabase
        .from("sce_reactions")
        .select("*")
        .eq("type", type)
        .single();
    },
    {
      staleTime: Infinity,
    }
  );
};

export default useReaction;
