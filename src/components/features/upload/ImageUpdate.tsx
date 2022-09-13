import Button from "@/components/shared/Button";
import FormSelect from "@/components/shared/FormSelect";
import Loading from "@/components/shared/Loading";
import useConstantTranslation from "@/hooks/useConstantTranslation";
import useUpdateImages from "@/hooks/useUpdateImages";
import { Attachment } from "@/services/upload";
import { RevertLanguagesDetectFormat } from "@/types/anilist";
import { createAttachmentUrl, createFileFromUrl } from "@/utils";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import ImageUpload from "./ImageUpload";

interface ImageUpdateProps {
  initialImages: Attachment[];
  chapterSlug: string;
  lang: string;
}

const ImageUpdate: React.FC<ImageUpdateProps> = ({
  initialImages,
  chapterSlug,
  lang,
}) => {
  const [files, setFiles] = useState<File[]>(null);
  const { LANGUAGES_DETECT } = useConstantTranslation();

  const { data: initialFiles, isLoading: initialFilesLoading } = useQuery<
    File[]
  >(["uploaded-images", initialImages], async () => {
    if (!initialImages?.length) return [];

    return Promise.all<File>(
      initialImages.map((file) =>
        createFileFromUrl(createAttachmentUrl(file.url), file.filename)
      )
    );
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();

  const { t } = useTranslation("common");

  const { mutate: updateImage, isLoading: isUpdateLoading } =
    useUpdateImages(chapterSlug);

  const onSubmit = (data) => {
    updateImage({
      images: files,
      lang: RevertLanguagesDetectFormat[data.lang],
    });
  };

  return initialFilesLoading ? (
    <Loading />
  ) : (
    <div className="space-y-4">
      <ImageUpload initialFiles={initialFiles} onChange={setFiles} />
      <form id="hook-form" onSubmit={handleSubmit(onSubmit)}>
        <FormSelect
          control={control}
          rules={{ required: "Language is required!" }}
          defaultValue={lang}
          name="lang"
          selectProps={{
            placeholder: t("language"),
            options: LANGUAGES_DETECT,
          }}
          label={t("language")}
        />
        <p className="text-xs mt-2">
          Note: Language affects multi-languages for mangas/comics, <br />
          Please select the right language!
        </p>

        {errors.lang && (
          <p className="text-red-500 mt-2">{errors.lang.message}</p>
        )}
      </form>

      <Button
        type="submit"
        form="hook-form"
        className="ml-auto"
        isLoading={isUpdateLoading}
        primary
      >
        Cập nhật
      </Button>
    </div>
  );
};

export default ImageUpdate;
