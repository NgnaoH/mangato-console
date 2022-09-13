import React, { useMemo } from "react";
import MediaDetails from "@/components/features/upload/MediaDetails";
import UploadContainer from "@/components/features/upload/UploadContainer";
import UploadLayout from "@/components/layouts/UploadLayout";
import Button from "@/components/shared/Button";
import DeleteConfirmation from "@/components/shared/DeleteConfirmation";
import Loading from "@/components/shared/Loading";
import Section from "@/components/shared/Section";
import { UploadMediaProvider } from "@/contexts/UploadMediaContext";
import useMediaDetails from "@/hooks/useMediaDetails";
import useUploadedChapters from "@/hooks/useUploadedChapters";
import { AdditionalUser, Chapter } from "@/types";
import { MediaType } from "@/types/anilist";
import { getDescription, getTitle, sortMediaUnit } from "@/utils/data";
import { NextPage } from "next";
import Link from "next/link";
import { IoIosAddCircleOutline } from "react-icons/io";
import useMangaSourceDelete from "@/hooks/useMangaSourceDelete";
import { useQueryClient } from "react-query";
import AddTranslationModal from "@/components/shared/AddTranslationModal";
import { useRouter } from "next/router";
import withAuthRedirect from "@/hocs/withAuthRedirect";
import ChapperBar from "@/components/features/upload/ChapperBar";

interface UploadMangaPageProps {
  user: AdditionalUser;
  sourceId: string;
}

const UploadMangaPage: NextPage<UploadMangaPageProps> = ({
  user,
  sourceId,
}) => {
  const router = useRouter();
  const mediaId = Number(router.query.id);
  const { data: manga, isLoading: mediaLoading } = useMediaDetails({
    type: MediaType.Manga,
    id: mediaId,
  });

  const queryClient = useQueryClient();

  const { locale } = useRouter();

  const { mutate: mangaSourceDelete, isLoading: deleteLoading } =
    useMangaSourceDelete(`${sourceId}-${mediaId}`);

  const { data: uploadedChapters, isLoading: chaptersLoading } =
    useUploadedChapters({
      mediaId,
      sourceId,
    });

  const sortedChapters = useMemo(() => {
    if (chaptersLoading) return [];

    return sortMediaUnit(uploadedChapters);
  }, [chaptersLoading, uploadedChapters]);

  const title = useMemo(() => getTitle(manga, locale), [manga, locale]);
  const description = useMemo(
    () => getDescription(manga, locale),
    [manga, locale]
  );

  const handleConfirm = () => {
    mangaSourceDelete(null, {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "uploaded-chapters",
          { mediaId, sourceId },
        ]);
      },
    });
  };

  return (
    <UploadLayout>
      <UploadContainer className="pb-12" isVerified={user.isVerified}>
        {mediaLoading || chaptersLoading || deleteLoading ? (
          <Loading />
        ) : (
          <UploadMediaProvider value={{ sourceId, mediaId }}>
            <div className="space-y-8">
              <MediaDetails media={manga} />

              <div className="mt-8">
                <div className="w-full flex justify-end items-center gap-x-2 [&>*]:w-max mb-8">
                  <Link href={`/upload/manga/${mediaId}/chapters/create`}>
                    <a>
                      <Button LeftIcon={IoIosAddCircleOutline} primary>
                        Chapter mới
                      </Button>
                    </a>
                  </Link>

                  <AddTranslationModal
                    mediaId={mediaId}
                    mediaType={MediaType.Manga}
                    defaultDescription={description}
                    defaultTitle={title}
                  />
                </div>

                <div className="space-y-2">
                  {sortedChapters.map((chapter: Chapter) => (
                    <ChapperBar
                      chapter={chapter}
                      mediaId={mediaId}
                      key={chapter.slug}
                    />
                  ))}
                </div>
              </div>
            </div>
          </UploadMediaProvider>
        )}
      </UploadContainer>

      {!mediaLoading && (
        <Section className="fixed bottom-0 py-3 flex justify-end gap-2 items-center bg-background-800 w-full md:w-4/5">
          <DeleteConfirmation
            onConfirm={handleConfirm}
            className="space-y-4"
            confirmString={manga.title.userPreferred}
          >
            <h1 className="text-2xl font-semibold">
              Bạn có chắc chắn xóa không?
            </h1>

            <p>
              Một khi đã xóa, bạn sẽ không thể khôi phục lại. Điều này sẽ xóa
              hoàn toàn bất kỳ dữ liệu nào liên quan đến manga này.
            </p>
          </DeleteConfirmation>
        </Section>
      )}
    </UploadLayout>
  );
};

export default withAuthRedirect(UploadMangaPage);
