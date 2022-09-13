import { supabase } from "@/utils/supabase";
import { useQuery } from "react-query";
import useUser from "./useUser";

const useIsSavedSub = () => {
  const { user } = useUser();

  return useQuery(
    ["saved_subscription", user?.id],
    async () => {
      const userAgent = navigator.userAgent;

      if (!userAgent) throw new Error("No user agent");

      // const { data, error } = await supabase
      //   .from("kaguya_subscriptions")
      //   .select("userId")
      //   .eq("userId", user.id)
      //   .eq("userAgent", encodeURIComponent(userAgent))
      //   .limit(1)
      //   .single();

      // if (error) return false;

      // return !!data;
      return null;
    },
    { enabled: !!user }
  );
};

export default useIsSavedSub;
