import Image from "@/components/shared/Image";
import Loading from "@/components/shared/Loading";
import ReportModal from "@/components/shared/ReportModal";
import Table from "@/components/shared/Table";
import { updateUserPermission } from "@/services/upload";
import { AdditionalUser, Report } from "@/types";
import dayjs from "dayjs";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Column } from "react-table";

interface ReportsTableProps {
  user: AdditionalUser;
  reports: Report[];
  totalReport: number;
}

const ReportsTable: React.FC<ReportsTableProps> = ({
  user,
  reports,
  totalReport,
}) => {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { locale, query } = router;
  const queryClient = useQueryClient();

  const [pageSize, setPageSize] = useState(Number(query.limit));
  const [pageIndex, setPageIndex] = useState(Number(query.page));

  const { mutate: updateUser, isLoading } = useMutation({
    mutationFn: async (data) => {
      await updateUserPermission(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  useEffect(() => {
    router.replace({
      pathname: "/admin/reports",
      query: {
        ...query,
        page: pageIndex || 0,
        limit: pageSize || 10,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex]);

  const columns: Column<any>[] = [
    {
      Header: t("type"),
      accessor: "type",
      Cell: ({ cell }) => {
        const { type }: Report = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{t(type)}</p>
          </div>
        );
      },
    },
    {
      Header: t("reporter"),
      accessor: "reporter",
      Cell: ({ cell }) => {
        const { reporter }: Report = cell.row.original;
        const src = reporter.user_metadata.avatar_url;
        return (
          <div className="p-2 shrink-0 relative w-10 h-10 rounded-full ml-8">
            <Image
              layout="fill"
              className="rounded-full"
              src={src ? src : "/fallback_profile.png"}
              alt={src}
            />
          </div>
        );
      },
    },
    {
      Header: t("reason"),
      accessor: "reason",
      Cell: ({ cell }) => {
        const { reason }: Report = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{reason}</p>
          </div>
        );
      },
    },
    {
      Header: t("target"),
      accessor: "target",
      Cell: ({ cell }) => {
        const { chapter, user }: Report = cell.row.original;
        if (user) {
          const src = user.user_metadata.avatar_url;
          return (
            <div className="p-2 shrink-0 relative w-10 h-10 rounded-full ml-8">
              <Image
                layout="fill"
                className="rounded-full"
                src={src ? src : "/fallback_profile.png"}
                alt={src}
              />
            </div>
          );
        }

        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{chapter.name}</p>
          </div>
        );
      },
    },
    {
      Header: t("created_at"),
      accessor: "createdAt",
      Cell: ({ cell }) => {
        const { created_at }: Report = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">
              {dayjs(created_at, { locale }).fromNow()}
            </p>
          </div>
        );
      },
    },
    {
      Header: "",
      accessor: "action",
      Cell: ({ cell }) => {
        return (
          <div className="w-full flex items-center justify-center">
            <p className="line-clamp-5 cursor-pointer">
              <ReportModal
                report={cell.row.original}
                updateReport={updateUser}
                isUpdating={isLoading}
              />
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Table
          initialState={{ pageIndex, pageSize }}
          manualPagination
          pageCount={Math.ceil(totalReport / pageSize || 0)}
          columns={columns}
          data={reports || []}
          onPageSizeChange={setPageSize}
          onPageIndexChange={setPageIndex}
        />
      )}
    </>
  );
};

export default ReportsTable;
