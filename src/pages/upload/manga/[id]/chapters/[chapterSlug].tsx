import ChapterNameUpdate from "@/components/features/upload/ChapterNameUpdate";
import ImageUpdate from "@/components/features/upload/ImageUpdate";
import UploadContainer from "@/components/features/upload/UploadContainer";
import UploadSection from "@/components/features/upload/UploadSection";
import UploadLayout from "@/components/layouts/UploadLayout";
import Button from "@/components/shared/Button";
import DeleteConfirmation from "@/components/shared/DeleteConfirmation";
import Loading from "@/components/shared/Loading";
import Section from "@/components/shared/Section";
import { supportedUploadImageFormats } from "@/constants";
import { UploadMediaProvider } from "@/contexts/UploadMediaContext";
import withAuthRedirect from "@/hocs/withAuthRedirect";
import useChapterDelete from "@/hooks/useChapterDelete";
import useUploadedChapter from "@/hooks/useUploadedChapter";
import { AdditionalUser } from "@/types";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
interface UploadChapterEditPageProps {
  user: AdditionalUser;
  sourceId: string;
}

const UploadChapterEditPage: NextPage<UploadChapterEditPageProps> = ({
  sourceId,
  user,
}) => {
  const router = useRouter();
  const chapterSlug: any = router.query.chapterSlug;
  const mediaId = Number(router.query.id);

  const { data, isLoading } = useUploadedChapter(chapterSlug);
  const { mutate: deleteChapter, isLoading: deleteLoading } =
    useChapterDelete(chapterSlug);

  const chapterId = useMemo(() => chapterSlug.split("-")[1], [chapterSlug]);

  const handleDelete = () => {
    deleteChapter(null, {
      onSuccess: () => {
        router.replace(`/upload/manga/${mediaId}`);
      },
    });
  };

  return (
    <UploadLayout>
      <UploadMediaProvider value={{ mediaId, sourceId }}>
        <UploadContainer className="pb-8" isVerified={user.isVerified}>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="space-y-16">
              <UploadSection>
                <UploadSection.Left>
                  <label className="font-semibold text-2xl">T???p phim</label>
                </UploadSection.Left>

                <UploadSection.Right>
                  <ChapterNameUpdate
                    initialName={data.name}
                    chapterSlug={data.slug}
                  />
                </UploadSection.Right>
              </UploadSection>

              <UploadSection>
                <UploadSection.Left>
                  <label className="font-semibold text-2xl">H??nh ???nh</label>
                  <p className="text-sm text-gray-300">
                    H??? tr??? {supportedUploadImageFormats.join(", ")}
                  </p>
                </UploadSection.Left>

                <UploadSection.Right className="relative space-y-1">
                  <ImageUpdate
                    initialImages={data.images?.[0].images}
                    chapterSlug={chapterSlug}
                    lang={data.language}
                  />
                </UploadSection.Right>
              </UploadSection>
            </div>
          )}
        </UploadContainer>

        {!isLoading && (
          <Section className="py-3 flex justify-between items-center fixed bottom-0 w-full md:w-4/5 bg-background-800">
            <DeleteConfirmation
              isLoading={deleteLoading}
              onConfirm={handleDelete}
              className="space-y-4"
              confirmString={data.name}
            >
              <h1 className="text-2xl font-semibold">
                B???n c?? ch???c ch???n x??a kh??ng?
              </h1>

              <p>
                M???t khi ???? x??a, b???n s??? kh??ng th??? kh??i ph???c l???i. ??i???u n??y s??? x??a
                ho??n to??n b???t k??? d??? li???u n??o li??n quan ?????n ch????ng n??y.
              </p>
            </DeleteConfirmation>

            <div className="flex gap-2 items-center">
              <Link href={`/upload/manga/${mediaId}/chapters/create`}>
                <a>
                  <Button secondary>T???o ch????ng m???i</Button>
                </a>
              </Link>

              <Link href={`/manga/read/${mediaId}/${sourceId}/${chapterId}`}>
                <a>
                  <Button primary>Xem ch????ng</Button>
                </a>
              </Link>
            </div>
          </Section>
        )}
      </UploadMediaProvider>
    </UploadLayout>
  );
};

export default withAuthRedirect(UploadChapterEditPage);
