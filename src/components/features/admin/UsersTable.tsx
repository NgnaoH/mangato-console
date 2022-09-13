import EditUserModal from "@/components/shared/EditUserModel";
import Image from "@/components/shared/Image";
import Loading from "@/components/shared/Loading";
import Table from "@/components/shared/Table";
import config from "@/config";
import { updateUserPermission } from "@/services/upload";
import { AdditionalUser } from "@/types";
import dayjs from "dayjs";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { useMutation, useQueryClient } from "react-query";
import { Column } from "react-table";

interface UsersTableProps {
  user: AdditionalUser;
  users: AdditionalUser[];
  totalUser: number;
}

const UsersTable: React.FC<UsersTableProps> = ({ user, users, totalUser }) => {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { locale, query } = router;

  const [pageSize, setPageSize] = useState(Number(query.limit));
  const [pageIndex, setPageIndex] = useState(Number(query.page));

  const queryClient = useQueryClient();

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
      pathname: "/admin/users",
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
      Header: t("avatar"),
      accessor: "coverImage",
      Cell: ({ cell }) => {
        const originalCell: AdditionalUser = cell.row.original;
        const src = originalCell.user_metadata.avatar_url;
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
      Header: t("name"),
      accessor: "name",
      Cell: ({ cell }) => {
        const originalCell: AdditionalUser = cell.row.original;
        const fullName = originalCell.user_metadata.full_name;

        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{fullName}</p>
          </div>
        );
      },
    },
    {
      Header: "Email",
      accessor: "email",
      Cell: ({ cell }) => {
        const originalCell: AdditionalUser = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">{originalCell.email}</p>
          </div>
        );
      },
    },
    {
      Header: t("role"),
      accessor: "role",
      Cell: ({ cell }) => {
        const { authRole, isVerified }: AdditionalUser = cell.row.original;
        const role = {
          admin: t("admin"),
          user: t("uploader"),
          norUser: t("user"),
        };
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">
              {isVerified ? role[authRole] : role.norUser}
            </p>
          </div>
        );
      },
    },
    {
      Header: t("status"),
      accessor: "status",
      Cell: ({ cell }) => {
        const { deactived }: AdditionalUser = cell.row.original;
        return (
          <div className="px-6 py-4">
            <p className="line-clamp-5">
              <GoPrimitiveDot
                fill={deactived ? "rgb(220 38 38)" : "rgb(34, 197, 94)"}
                size={32}
              />
            </p>
          </div>
        );
      },
    },
    {
      Header: t("created_at"),
      accessor: "createdAt",
      Cell: ({ cell }) => {
        const { created_at }: AdditionalUser = cell.row.original;
        return (
          <div className="w-full flex items-center justify-center">
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
        const { updated_at }: AdditionalUser = cell.row.original;
        return (
          <div className="w-full flex items-center justify-center">
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
        const { id, email }: AdditionalUser = cell.row.original;
        return (
          <div className="w-full flex items-center justify-center">
            <p className="line-clamp-5 cursor-pointer">
              {user.id === id || email === config.masterEmail ? null : (
                <EditUserModal
                  user={cell.row.original}
                  updateUser={updateUser}
                  isUpdating={isLoading}
                />
              )}
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
          pageCount={Math.ceil(totalUser / pageSize || 0)}
          columns={columns}
          data={users || []}
          onPageSizeChange={setPageSize}
          onPageIndexChange={setPageIndex}
        />
      )}
    </>
  );
};

export default UsersTable;
