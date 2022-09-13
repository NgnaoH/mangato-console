import BaseButton from "@/components/shared/BaseButton";
import { multilangStatusCons } from "@/constants";
import useInterval from "@/hooks/useInterval";
import { Chapter } from "@/types";
import { supabase } from "@/utils/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsTranslate } from "react-icons/bs";
import { useMutation } from "react-query";

interface ChapterBar {
  chapter: Chapter;
  mediaId: number;
}
interface Status {
  multilang: string;
}

const CHECK_STATUS_CHAPTER_INTERVAL = 2000;

const ChapperBar: React.FC<ChapterBar> = ({ chapter, mediaId }) => {
  // const queryClient = useQueryClient();
  const [isPolling, setPolling] = useState(true);
  const [multilangStatus, setMultilangStatus] = useState(chapter.multilang);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data }: PostgrestSingleResponse<Status> = await supabase
        .from("kaguya_chapters")
        .select("multilang")
        .eq("slug", chapter.slug)
        .single();

      return data;
    },
    onSuccess: ({ multilang }) => {
      setMultilangStatus(multilang);
    },
  });

  useInterval(
    () => {
      mutation.mutate();
    },
    isPolling ? CHECK_STATUS_CHAPTER_INTERVAL : null
  );

  useEffect(() => {
    if (multilangStatus !== multilangStatusCons.processing) {
      setPolling(false);
      return;
    }
    if (multilangStatus === multilangStatusCons.processing) {
      setPolling(true);
    }
  }, [multilangStatus]);

  const renderStatus = (status) => (
    <>
      {status === multilangStatusCons.ready && (
        <p className="text-green-500 flex">
          Đa ngôn ngữ
          <span className="flex items-center ml-2">
            <BsTranslate />
          </span>
        </p>
      )}
      {status === multilangStatusCons.processing && (
        <p className="text-cyan-500">Đang xử lí ...</p>
      )}
      {status === multilangStatusCons.error && (
        <p className="text-red-500">Có lỗi xảy ra!</p>
      )}
    </>
  );

  return (
    <Link href={`/upload/manga/${mediaId}/chapters/${chapter.slug}`}>
      <a className="block">
        <BaseButton className="flex justify-between p-3 w-full !bg-background-900 hover:!bg-white/20 rounded-md">
          <span>{chapter.name}</span>
          {renderStatus(multilangStatus)}
        </BaseButton>
      </a>
    </Link>
  );
};

export default ChapperBar;
