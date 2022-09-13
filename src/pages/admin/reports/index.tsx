import ReportsTable from "@/components/features/admin/ReportsTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/shared/Button";
import FormSelect from "@/components/shared/FormSelect";
import Input from "@/components/shared/Input";
import Loading from "@/components/shared/Loading";
import { typeReport } from "@/components/shared/ReportConfirmation";
import Section from "@/components/shared/Section";
import StatisticBox from "@/components/shared/StatisticBox";
import withAuthAdmin from "@/hocs/withAuthAdmin";
import useConstantTranslation from "@/hooks/useConstantTranslation";
import { AdditionalUser, Report } from "@/types";
import { supabase } from "@/utils/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { isEmpty, isNull } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineSearch } from "react-icons/ai";
import { FaEyeSlash, FaUserSlash } from "react-icons/fa";
import { GoReport } from "react-icons/go";
import { useQuery } from "react-query";

interface ReportsProps {
  user: AdditionalUser;
  sourceId: string;
}

interface DataReports {
  reports: Report[];
  count: number;
}

export const QUERY_KEY_REPORTS = "listReport";

const Reports: React.FC<ReportsProps> = ({ user, sourceId }) => {
  const [totalReports, setTotalReports] = useState<number>(null);
  const [totalReportsUpload, setTotalReportsUpload] = useState<number>(null);
  const [totalReportsAdmin, setTotalReportsAdmin] = useState<number>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { query } = router;
  const { page, limit } = query;
  const { TYPE_REPORT } = useConstantTranslation();

  // @ts-ignore
  const { data: dataReports } = useQuery<any>({
    queryKey: [
      QUERY_KEY_REPORTS,
      {
        ...query,
        page: Number(page),
        limit: Number(limit),
      },
    ],
    queryFn: getReports,
  });

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
    getTotalReports().then(setTotalReports);
    getTotalReportsUser().then(setTotalReportsUpload);
    getTotalReportsChapter().then(setTotalReportsAdmin);
  }, []);

  useEffect(() => {
    if (
      isNull(totalReports) ||
      isNull(totalReportsUpload) ||
      isNull(totalReportsAdmin)
    )
      return;
    setLoading(false);
  }, [totalReports, totalReportsUpload, totalReportsAdmin]);

  const handleSeach = () => {
    const { reason, type, reporter } = getValues();

    if (!isDirty) return;
    router.replace({
      pathname: "/admin/reports",
      query: {
        page,
        limit,
        ...(reason ? { reason } : undefined),
        ...(type ? { type } : undefined),
        ...(reporter ? { reporter } : undefined),
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
              title={t("total_reports")}
              Icon={GoReport}
              value={totalReports}
            />
            <StatisticBox
              title={t("total_reports_user")}
              Icon={FaUserSlash}
              value={totalReportsUpload}
            />
            <StatisticBox
              title={t("total_reports_chapter")}
              Icon={FaEyeSlash}
              value={totalReportsAdmin}
            />
          </div>
          <Section
            hasPadding={false}
            className="flex items-center gap-6 pb-6 pt-6"
          >
            <FormSelect
              control={control}
              name="type"
              selectProps={{
                placeholder: t("type_report"),
                options: TYPE_REPORT,
              }}
              label={t("type_report")}
            />
            <Input
              {...register("reporter")}
              containerInputClassName="border border-white/80"
              LeftIcon={AiOutlineSearch}
              label={t("reporter")}
              containerClassName="hidden md:block shrink-0"
            />
            <Input
              {...register("reason")}
              containerInputClassName="border border-white/80"
              LeftIcon={AiOutlineSearch}
              label={t("reason")}
              containerClassName="hidden md:block shrink-0"
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
            <ReportsTable
              user={user}
              reports={dataReports?.reports}
              totalReport={dataReports?.count}
            />
          </Section>
        </Section>
      )}
    </AdminLayout>
  );
};

const getReports = async ({ queryKey }) => {
  const [_, params] = queryKey;
  const { page, limit, reason, type, reporter } = params;

  // @ts-ignore
  let query = supabase
    .from("reports")
    .select(
      "*, reporter: reporterId!inner(*), user: userId(*), chapter: chapterId(*, uploader: userId(*))",
      { count: "exact" }
    )
    .range(page * limit, page * limit + limit - 1);

  if (reporter?.length)
    query = query.filter(
      "reporter.email",
      "ilike",
      `%${reporter.toLowerCase()}%`
    );

  if (type) query = query.eq("type", type);

  if (reason?.length)
    query = query.ilike("reason", `%${reason.toLowerCase()}%`);

  const { data: reports, count } = await query;

  return { reports, count };
};

const getTotalReports = async () => {
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact" });

  return count;
};

const getTotalReportsUser = async () => {
  const { count } = await supabase
    .from("reports")
    .select("type", { count: "exact" })
    .eq("type", typeReport.user);

  return count;
};
const getTotalReportsChapter = async () => {
  const { count } = await supabase
    .from("reports")
    .select("type", { count: "exact" })
    .eq("type", typeReport.chapter);

  return count;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx;

  if (isEmpty(query)) {
    return {
      redirect: {
        destination: "/admin/reports?page=0&limit=10",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default withAuthAdmin(Reports);
