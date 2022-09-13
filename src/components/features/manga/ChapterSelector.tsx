import ArrowSwiper, { SwiperSlide } from "@/components/shared/ArrowSwiper";
import Button from "@/components/shared/Button";
import CircleButton from "@/components/shared/CircleButton";
import ReportConfirmation, {
  typeReport,
} from "@/components/shared/ReportConfirmation";
import useCreateReport from "@/hooks/useCreateReport";
import { Chapter } from "@/types";
import { groupBy } from "@/utils";
import { User } from "@supabase/supabase-js";
import classNames from "classnames";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { MdReport } from "react-icons/md";

export interface ChapterSelectorProps {
  chapters: Chapter[];
  mediaId: number;
  user: User;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  mediaId,
  user,
}) => {
  const [isChapterExpanded, setIsChapterExpanded] = useState(false);
  const { mutate: createReport } = useCreateReport();

  const [activeSource, setActiveSource] = useState(chapters[0].source.name);

  const sourceChapters = useMemo(
    () =>
      chapters
        .filter((chapter) => chapter.source.name === activeSource)
        .reverse()
        .slice(0, isChapterExpanded ? undefined : 10),
    [activeSource, chapters, isChapterExpanded]
  );

  const sources = useMemo(
    () => groupBy(chapters, (data) => data.source.name),
    [chapters]
  );

  useEffect(() => {
    const sourceKeys = Object.keys(sources);

    if (!sourceKeys?.length) return;

    if (!sourceKeys.includes(activeSource)) {
      setActiveSource(sourceKeys[0]);
    }
  }, [activeSource, sources]);

  const handleReportChapter = (reason: string, slug: string) => {
    createReport({
      reporterId: user.id,
      type: typeReport.chapter,
      chapterId: slug,
      reason,
    });
  };

  return (
    <React.Fragment>
      <ArrowSwiper isOverflowHidden={false} className="w-11/12 mx-auto mb-8">
        {Object.keys(sources).map((source, i) => {
          return (
            <SwiperSlide onClick={() => setActiveSource(source)} key={i}>
              <div
                className={classNames(
                  "text-gray-300 cursor-pointer mx-4 rounded-[18px] px-3 py-1 w-[max-content] duration-300 transition",
                  activeSource === source
                    ? "bg-white text-black"
                    : "hover:text-white"
                )}
              >
                {source}
              </div>
            </SwiperSlide>
          );
        })}
      </ArrowSwiper>

      <motion.div
        className="space-y-2 overflow-hidden"
        variants={{
          animate: {
            height: "100%",
          },

          initial: {
            height: chapters.length <= 7 ? "100%" : 300,
          },
        }}
        transition={{ ease: "linear" }}
        animate={isChapterExpanded ? "animate" : "initial"}
      >
        {sourceChapters.map((chapter, index) => (
          <div
            key={chapter.sourceChapterId}
            className="bg-background-900 text-sm font-semibold hover:bg-white/20 duration-300 transition flex items-center justify-between"
          >
            <Link
              href={`/manga/read/${mediaId}/${chapter.sourceId}/${chapter.sourceChapterId}`}
            >
              <a className="block p-2 w-full">
                <p className="line-clamp-1">{chapter.name}</p>
              </a>
            </Link>
            <ReportConfirmation
              reference={
                <Button
                  iconClassName="w-5 h-5"
                  className="hover:bg-red-500"
                  secondary
                  LeftIcon={MdReport}
                />
              }
              type={typeReport.chapter}
              onConfirm={(reason) => handleReportChapter(reason, chapter.slug)}
            />
          </div>
        ))}
      </motion.div>

      {chapters.length > 7 && (
        <CircleButton
          onClick={() => setIsChapterExpanded(!isChapterExpanded)}
          outline
          className="absolute top-full mt-4 left-1/2 -translate-x-1/2"
          LeftIcon={isChapterExpanded ? BsChevronUp : BsChevronDown}
        />
      )}
    </React.Fragment>
  );
};

export default ChapterSelector;
