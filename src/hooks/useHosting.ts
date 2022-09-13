import { supabase, useSupabaseSingleQuery } from "@/utils/supabase";

const useHosting = (hostingId: string) => {
  return useSupabaseSingleQuery(["hosting", hostingId], () =>
    supabase.from("kaguya_hostings").select("*").eq("id", hostingId)
  );
};

export default useHosting;
