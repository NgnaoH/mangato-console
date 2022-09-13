import { Notification } from "@/types";
import { supabase } from "@/utils/supabase";
import { useMutation, useQueryClient } from "react-query";
import useUser from "./useUser";

const convertToReadNotifcations = (notifications: Partial<Notification>[]) => {
  return notifications.map((notification) => ({
    ...notification,
    notificationUsers: notification.notificationUsers.map(
      (notificationUser) => {
        notificationUser.isRead = true;

        return notificationUser;
      }
    ),
  }));
};

const useSeenNotifications = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation<any, any, any, any>(
    async (notifications) => {
      if (!user) throw new Error("User not logged in");

      const notifcationUsers = notifications
        .flatMap((notification) => notification.notificationUsers)
        .filter((notificationUser) => notificationUser.userId === user.id);

      const { data, error } = await supabase
        .from("kaguya_notification_users")
        .upsert(notifcationUsers);

      if (error) throw error;

      return data;
    },
    {
      onMutate: (notifications) => {
        const readNotifications = convertToReadNotifcations(notifications);

        queryClient.setQueryData(["notifications"], readNotifications);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["notifications"]);
      },
    }
  );
};

export default useSeenNotifications;
