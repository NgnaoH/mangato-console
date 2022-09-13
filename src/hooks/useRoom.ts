import { getMediaDetails } from "@/services/anilist";
import { mediaDefaultFields } from "@/services/anilist/queries";
import { Room } from "@/types";
import { MediaType } from "@/types/anilist";
import { supabase } from "@/utils/supabase";
import { useMemo } from "react";
import { useQuery } from "react-query";
import { toast } from "react-toastify";

const useRoom = (roomId: number, initialData: Room) => {
  const queryKey = useMemo(() => ["room", roomId], [roomId]);

  return useQuery(
    queryKey,
    async () => {
      // @ts-ignore
      const { data: room, error } = await supabase
        .from("kaguya_rooms")
        .select(
          `
            *,
            episode:episodeId(*),
            users:kaguya_room_users(*),
            hostUser:hostUserId(*)
          `
        )
        .eq("id", roomId)
        .limit(1)
        .single();

      if (error) throw error;

      // @ts-ignore
      const { data: sourceConnectionData } = await supabase
        .from("kaguya_anime_source")
        .select(
          `
            episodes:kaguya_episodes(*, source:kaguya_sources(*))
          `
        )
        .eq("mediaId", room.mediaId);

      const media = await getMediaDetails(
        {
          id: room.mediaId,
          type: MediaType.Anime,
        },
        mediaDefaultFields
      );

      const episodes = sourceConnectionData
        .flatMap((connection) => connection.episodes)
        .filter((episode) => episode.published);

      return { ...room, media, episodes };
    },

    {
      onError: (error: Error) => {
        toast.error(error.message);
      },
      initialData,
      enabled: false,
    }
  );
};

export default useRoom;
