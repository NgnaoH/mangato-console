import ChapterNameUpload from "@/components/features/upload/ChapterNameUpload";
import ImageUpload from "@/components/features/upload/ImageUpload";
import UploadContainer from "@/components/features/upload/UploadContainer";
import UploadSection from "@/components/features/upload/UploadSection";
import UploadLayout from "@/components/layouts/UploadLayout";
import Button from "@/components/shared/Button";
import FormSelect from "@/components/shared/FormSelect";
import Section from "@/components/shared/Section";
import { supportedUploadImageFormats } from "@/constants";
import withAuthRedirect from "@/hocs/withAuthRedirect";
import useConstantTranslation from "@/hooks/useConstantTranslation";
import useCreateChapter from "@/hooks/useCreateChapter";
import { AdditionalUser } from "@/types";
import { RevertLanguagesDetectFormat } from "@/types/anilist";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface UploadCreateChapterPageProps {
  user: AdditionalUser;
  sourceId: string;
}

const UploadCreateChapterPage: NextPage<UploadCreateChapterPageProps> = ({
  user,
  sourceId,
}) => {
  const router = useRouter();
  const mediaId = Number(router.query.id);
  const [images, setImages] = useState<File[]>([]);
  const [chapterName, setChapterName] = useState("");
  const { LANGUAGES_DETECT } = useConstantTranslation();

  const { mutate: createChapter } = useCreateChapter({
    mediaId,
    sourceId,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();

  const { t } = useTranslation("common");

  const onSubmit = (data) => {
    createChapter({
      chapterName,
      images,
      lang: RevertLanguagesDetectFormat[data.lang],
    });
  };

  return (
    <UploadLayout>
      <UploadContainer className="pb-12" isVerified={user.isVerified}>
        <div className="space-y-16">
          <UploadSection>
            <UploadSection.Left>
              <label className="font-semibold text-2xl">Chương</label>
            </UploadSection.Left>

            <UploadSection.Right>
              <ChapterNameUpload onChange={setChapterName} />
            </UploadSection.Right>
          </UploadSection>

          <UploadSection>
            <UploadSection.Left>
              <label className="font-semibold text-2xl">Hình ảnh</label>
              <p className="text-sm text-gray-300">
                Hỗ trợ {supportedUploadImageFormats.join(", ")}
              </p>
            </UploadSection.Left>

            <UploadSection.Right>
              <ImageUpload onChange={setImages} />
              <form
                id="hook-form"
                className="mt-5"
                onSubmit={handleSubmit(onSubmit)}
              >
                <FormSelect
                  control={control}
                  rules={{ required: "Language is required!" }}
                  name="lang"
                  selectProps={{
                    placeholder: t("language"),
                    options: LANGUAGES_DETECT,
                  }}
                  label={t("language")}
                />
                <p className="text-xs mt-2">
                  Note: Language affects multi-languages for mangas/comics,{" "}
                  <br /> Please select the right language!
                </p>

                {errors.lang && (
                  <p className="text-red-500 mt-2">{errors.lang.message}</p>
                )}
              </form>
            </UploadSection.Right>
          </UploadSection>
        </div>
      </UploadContainer>

      <Section className="py-3 flex justify-end gap-2 items-center fixed bottom-0 w-full md:w-4/5 bg-background-800">
        <Button type="submit" form="hook-form" primary>
          Upload
        </Button>
      </Section>
    </UploadLayout>
  );
};

export default withAuthRedirect(UploadCreateChapterPage);
