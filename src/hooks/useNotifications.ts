import { supabase, useSupabaseQuery } from "@/utils/supabase";
import useUser from "./useUser";

const useNotifications = () => {
  const { user } = useUser();

  return useSupabaseQuery(
    ["notifications"],
    () => {
      // @ts-ignore
      return supabase
        .from("kaguya_notifications")
        .select(
          "*, sender:senderId(user_metadata), notificationUsers:kaguya_notification_users(*)"
        )
        .eq("receiverId", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
    },
    {
      enabled: !!user,
      refetchOnWindowFocus: true,
    }
  );
};

export default useNotifications;
