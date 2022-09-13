import { supabase, useSupabaseQuery } from "@/utils/supabase";
import { useQueryClient } from "react-query";

const useReactions = () => {
  const queryClient = useQueryClient();

  return useSupabaseQuery(
    ["reactions"],
    () => {
      return supabase
        .from("sce_reactions")
        .select("*")
        .order("type", { ascending: true });
    },
    {
      staleTime: Infinity,
      onSuccess: (data) => {
        data?.forEach((reaction: any) => {
          queryClient.setQueryData(["reaction", reaction.type], reaction);
        });
      },
    }
  );
};

export default useReactions;
