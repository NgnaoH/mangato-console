import { supabase } from "@/utils/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "react-query";
import useUser from "./useUser";

const useCreateSubscription = () => {
  const { user } = useUser();

  return useMutation<any, PostgrestError, PushSubscription, any>(
    async (subscription) => {
      const userAgent = navigator.userAgent;

      // const { data, error } = await supabase
      //   .from("kaguya_subscriptions")
      //   .upsert({
      //     subscription,
      //     userId: user.id,
      //     userAgent: encodeURIComponent(userAgent),
      //   });

      // if (error) throw error;

      // return data;
      return null
    }
  );
};

export default useCreateSubscription;
