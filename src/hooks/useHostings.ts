import { supabase, useSupabaseQuery } from "@/utils/supabase";

const useHostings = () => {
  return useSupabaseQuery(["hostings"], () =>
    supabase.from("kaguya_hostings").select("*")
  );
};

export default useHostings;
