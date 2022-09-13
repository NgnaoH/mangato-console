import UploadContainer from "@/components/features/upload/UploadContainer";
import UploadLayout from "@/components/layouts/UploadLayout";
import HorizontalCard from "@/components/shared/HorizontalCard";
import Section from "@/components/shared/Section";
import StatisticBox from "@/components/shared/StatisticBox";
import withAuthRedirect from "@/hocs/withAuthRedirect";
import { getMedia } from "@/services/anilist";
import { AdditionalUser } from "@/types";
import { Media, MediaType } from "@/types/anilist";
import { supabase } from "@/utils/supabase";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { BiImage } from "react-icons/bi";

interface UploadPageProps {
  user: AdditionalUser;
  sourceId: string;
}

const UploadPage: NextPage<UploadPageProps> = ({ user, sourceId }) => {
  const [totalManga, setTotalManga] = useState<number>(0);
  const [recentlyUpdatedManga, setRecentlyUpdatedManga] = useState<
    Array<Media>
  >([]);

  useEffect(() => {
    getTotalUploadedMedia(sourceId).then(setTotalManga);
    getRecentlyUpdatedMedia(sourceId).then(setRecentlyUpdatedManga);
  }, [sourceId]);

  return (
    <UploadLayout>
      <UploadContainer
        title={`Hi, ${
          user.user_metadata.full_name || user.user_metadata.name
        }!`}
        isVerified={user.isVerified}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <StatisticBox
            title="Số Manga đã upload"
            Icon={BiImage}
            value={totalManga}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-4">
          <Section hasPadding={false} className="flex-1" title="Manga gần đây">
            <div className="bg-background-900 p-4">
              {recentlyUpdatedManga?.length ? (
                recentlyUpdatedManga.map((media) => (
                  <HorizontalCard
                    redirectUrl={`/upload/manga/${media.id}`}
                    key={media.id}
                    data={media}
                  />
                ))
              ) : (
                <p className="text-center text-gray-300">Không có dữ liệu</p>
              )}
            </div>
          </Section>
        </div>
      </UploadContainer>
    </UploadLayout>
  );
};

export default withAuthRedirect(UploadPage);

const getTotalUploadedMedia = async (sourceId: string) => {
  const { count } = await supabase
    .from("kaguya_manga_source")
    .select("id", { count: "exact" })
    .eq("sourceId", sourceId);

  return count;
};

const getRecentlyUpdatedMedia = async (sourceId: string) => {
  const episodeQuery = `
    mediaId,
    episodes:kaguya_episodes(
        updated_at
    )
  `;

  const chapterQuery = `
    mediaId,
    chapters:kaguya_chapters(
        updated_at
    )
  `;

  // @ts-ignore
  const { data } = await supabase
    .from("kaguya_manga_source")
    .select(chapterQuery)
    .eq("sourceId", sourceId)
    .order("updated_at", { ascending: false, foreignTable: "chapters" })
    .limit(5);

  const mangaIds = data.map((source: any) => source.mediaId);

  const mediaPromises: Promise<Media[]>[] = [];

  if (mangaIds.length) {
    const mangaPromise = getMedia({
      id_in: mangaIds,
      type: MediaType.Manga,
    });

    mediaPromises.push(mangaPromise);
  }

  if (!mediaPromises?.length) {
    return [];
  }

  const [manga = []] = await Promise.all(mediaPromises);

  const sortedMangaList = data
    .map((connection: any) => {
      const media = manga.find((a) => a.id === connection.mediaId);

      return media;
    })
    .filter((a) => a);

  return sortedMangaList || [];
};
