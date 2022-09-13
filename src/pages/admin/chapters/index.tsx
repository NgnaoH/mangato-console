import ChaptersTable from "@/components/features/admin/ChapterTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/shared/Button";
import FormSelect from "@/components/shared/FormSelect";
import Input from "@/components/shared/Input";
import Loading from "@/components/shared/Loading";
import Section from "@/components/shared/Section";
import StatisticBox from "@/components/shared/StatisticBox";
import { LANGUAGES_DETECT } from "@/constants/en";
import withAuthAdmin from "@/hocs/withAuthAdmin";
import { AdditionalUser, Chapter } from "@/types";
import { supabase } from "@/utils/supabase";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { isEmpty, isNull } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineSearch } from "react-icons/ai";
import { FaImages, FaUserEdit } from "react-icons/fa";
import { useQuery } from "react-query";

interface ChaptersProps {
  user: AdditionalUser;
  sourceId: string;
}

interface DataChapters {
  chapters: Chapter[];
  count: number;
}

export const QUERY_KEY_CHAPTERS = "listChapter";

const Chapters: React.FC<ChaptersProps> = ({ user, sourceId }) => {
  const [totalChapters, setTotalChapters] = useState<number>(null);
  const [totalUploader, setTotalUploader] = useState<number>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { query } = router;
  const { page, limit } = query;

  const { data: dataChapters } = useQuery<DataChapters, PostgrestError>(
    [
      QUERY_KEY_CHAPTERS,
      {
        ...query,
        page: Number(page),
        limit: Number(limit),
      },
    ],
    getChapters
  );

  const {
    control,
    register,
    getValues,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      ...query,
    },
  });

  useEffect(() => {
    getTotalChapters().then(setTotalChapters);
    getTotalUploader().then(setTotalUploader);
  }, []);

  useEffect(() => {
    if (isNull(totalChapters) || isNull(totalUploader)) return;
    setLoading(false);
  }, [totalChapters, totalUploader]);

  const handleSeach = () => {
    const { name, uploader, lang } = getValues();

    if (!isDirty) return;
    router.replace({
      pathname: "/admin/chapters",
      query: {
        page,
        limit,
        ...(uploader ? { uploader } : undefined),
        ...(name ? { name } : undefined),
        ...(lang ? { lang } : undefined),
      },
    });
  };

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <Section title={t("list_report")}>
          <div className="flex flex-col md:flex-row gap-4">
            <StatisticBox
              title={t("total_chapter")}
              Icon={FaImages}
              value={totalChapters}
            />
            <StatisticBox
              title={t("total_uploader")}
              Icon={FaUserEdit}
              value={totalUploader}
            />
          </div>
          <Section
            hasPadding={false}
            className="flex items-center gap-6 pb-6 pt-6"
          >
            <Input
              {...register("uploader")}
              containerInputClassName="border border-white/80"
              LeftIcon={AiOutlineSearch}
              label={t("uploader")}
              containerClassName="hidden md:block shrink-0"
            />
            <Input
              {...register("name")}
              containerInputClassName="border border-white/80"
              LeftIcon={AiOutlineSearch}
              label={t("name")}
              containerClassName="hidden md:block shrink-0"
            />
            <FormSelect
              control={control}
              name="lang"
              selectProps={{
                placeholder: t("language"),
                options: LANGUAGES_DETECT,
              }}
              label={t("language")}
            />
            <Button
              iconClassName="w-5 h-5"
              secondary
              onClick={handleSeach}
              className="h-10"
              shortcutKey="enter"
            />
          </Section>
          <Section hasPadding={false}>
            <ChaptersTable
              user={user}
              chapters={dataChapters?.chapters}
              totalChapter={dataChapters?.count}
            />
          </Section>
        </Section>
      )}
    </AdminLayout>
  );
};

const getChapters = async ({ queryKey }) => {
  const [_, params] = queryKey;
  const { page, limit, uploader, name, lang } = params;

  // @ts-ignore
  let query = supabase
    .from("kaguya_chapters")
    .select("*, uploader: userId!inner(*, sources: kaguya_sources(*))", {
      count: "exact",
    })
    .range(page * limit, page * limit + limit - 1);

  if (uploader?.length)
    query = query.filter(
      "uploader.email",
      "ilike",
      `%${uploader.toLowerCase()}%`
    );

  if (name?.length) query = query.ilike("name", `%${name.toLowerCase()}%`);

  if (lang) query = query.eq("language", lang);

  const { data: chapters, count } = await query;

  return { chapters, count };
};

const getTotalChapters = async () => {
  const { count } = await supabase
    .from("kaguya_chapters")
    .select("slug", { count: "exact" });

  return count;
};

const getTotalUploader = async () => {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("isVerified", true);

  return count;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx;

  if (isEmpty(query)) {
    return {
      redirect: {
        destination: "/admin/chapters?page=0&limit=10",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default withAuthAdmin(Chapters);
