import useUser from "@/hooks/useUser";
import { useTranslation } from "next-i18next";
import React from "react";
import ChapterSelector, { ChapterSelectorProps } from "./ChapterSelector";

interface LocaleChapterSelectorProps extends ChapterSelectorProps {}

const LocaleChapterSelector: React.FC<LocaleChapterSelectorProps> = ({
  chapters,
  user,
  ...props
}) => {
  const { t } = useTranslation("common");
  return (
    <React.Fragment>
      <div className="mt-4">
        {user && chapters?.length ? (
          <ChapterSelector chapters={chapters} user={user} {...props} />
        ) : (
          <p className="text-center text-2xl">{t("no_chapters")}</p>
        )}
      </div>
    </React.Fragment>
  );
};

export default LocaleChapterSelector;
