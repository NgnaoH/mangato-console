import Button from "@/components/shared/Button";
import DeleteConfirmation from "@/components/shared/DeleteConfirmation";
import Image from "@/components/shared/Image";
import Loading from "@/components/shared/Loading";
import Table from "@/components/shared/Table";
import { languageDetect, multilangStatusCons } from "@/constants";
import useChapterDelete from "@/hooks/useChapterDelete";
import { AdditionalUser, Chapter } from "@/types";
import dayjs from "dayjs";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { BsCheck, BsPlus } from "react-icons/bs";
import { useQueryClient } from "react-query";
import { Column } from "react-table";

interface ChaptersTableProps {
  user: AdditionalUser;
  chapters: Chapter[];
  totalChapter: number;
}

const ChaptersTable: React.FC<ChaptersTableProps> = ({
  user,
  chapters,
  totalChapter,
}) => {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { locale, query } = router;
  const queryClient = useQueryClient();

  const [pageSize, setPageSize] = useState(Number(query.limit));
  const [pageIndex, setPageIndex] = useState(Number(query.page));

  const { mutate: deleteChapter, isLoading } = useChapterDelete(
    undefined,
    () => {
      queryClient.invalidateQueries();
    }
  );

  useEffect(() => {
    router.replace({
      pathname: "/admin/chapters",
      query: {
        ...query,
        page: pageIndex || 0,
        limit: pageSize || 10,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex]);

  const handleDeleteChapter = (slug: string) => {
    deleteChapter(slug);
  };

  const columns: Column<any>[] = [
    {
      Header: t("uploader"),
      accessor: "uploader",
      Cell: ({ cell }) => {
        const { uploader }: Chapter = cell.row.original;
        const src = uploader.user_metadata.avatar_url;
        return (
          <div className="p-2 shrink-0 relative w-10 h-10 rounded-full ml-8">
            <Image
              layout="fill"
              className="rounded-full"
              src={src ? src : "/fallback_profile.png"}
              alt={src}
            />
            {/* <p className="line-clamp-5">{uploader.sources[0].name}</p> */}
          </div>
        );
      },
    },
    {
      Header: t("alias"),
      accessor: "alias",
      Cell: ({ cell }) => {
        const { uploader }: Chapter = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{uploader.sources[0].name}</p>
          </div>
        );
      },
    },
    {
      Header: t("name"),
      accessor: "name",
      Cell: ({ cell }) => {
        const { name }: Chapter = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{t(name)}</p>
          </div>
        );
      },
    },
    {
      Header: t("detected"),
      accessor: "detected",
      Cell: ({ cell }) => {
        const { multilang }: Chapter = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">
              {multilang === multilangStatusCons.ready && (
                <span className="text-white flex items-center">
                  <BsCheck className="text-green-500" size={32} />
                </span>
              )}
              {multilang === multilangStatusCons.error && (
                <span className="text-white flex">
                  <BsPlus
                    className="text-red-500 origin-center rotate-45"
                    size={32}
                  />
                </span>
              )}
              {multilang === multilangStatusCons.processing && (
                <span className="text-white flex">...</span>
              )}
            </p>
          </div>
        );
      },
    },
    {
      Header: t("language"),
      accessor: "language",
      Cell: ({ cell }) => {
        const { language }: Chapter = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{languageDetect[language]}</p>
          </div>
        );
      },
    },
    {
      Header: t("created_at"),
      accessor: "createdAt",
      Cell: ({ cell }) => {
        const { created_at }: Chapter = cell.row.original;
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
      Header: t("updated_at"),
      accessor: "updatedAt",
      Cell: ({ cell }) => {
        const { updated_at }: Chapter = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">
              {dayjs(updated_at, { locale }).fromNow()}
            </p>
          </div>
        );
      },
    },
    {
      Header: "",
      accessor: "action",
      Cell: ({ cell }) => {
        const { slug }: Chapter = cell.row.original;
        return (
          <div className="w-full flex items-center justify-center">
            <p className="line-clamp-5 cursor-pointer">
              <DeleteConfirmation
                reference={
                  <Button
                    iconClassName="w-5 h-5"
                    className="hover:bg-red-500"
                    secondary
                    LeftIcon={AiFillDelete}
                  />
                }
                onConfirm={() => handleDeleteChapter(slug)}
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
          pageCount={Math.ceil(totalChapter / pageSize || 0)}
          columns={columns}
          data={chapters || []}
          onPageSizeChange={setPageSize}
          onPageIndexChange={setPageIndex}
        />
      )}
    </>
  );
};

export default ChaptersTable;
