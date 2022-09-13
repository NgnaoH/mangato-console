import UsersTable from "@/components/features/admin/UsersTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Loading from "@/components/shared/Loading";
import Section from "@/components/shared/Section";
import StatisticBox from "@/components/shared/StatisticBox";
import withAuthAdmin from "@/hocs/withAuthAdmin";
import { AdditionalUser } from "@/types";
import { supabase } from "@/utils/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { isEmpty, isNull } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineSearch } from "react-icons/ai";
import { FaUserCog, FaUserEdit, FaUsers } from "react-icons/fa";
import { useQuery } from "react-query";

interface UsersPageProps {
  user?: AdditionalUser;
  sourceId?: string;
}

interface DataUser {
  users: AdditionalUser[];
  count: number;
}

export const QUERY_KEY_USERS = "listUser";

const Users: React.FC<UsersPageProps> = ({ user }) => {
  const [totalUsers, setTotalUsers] = useState<number>(null);
  const [totalUsersUpload, setTotalUsersUpload] = useState<number>(null);
  const [totalUsersAdmin, setTotalUsersAdmin] = useState<number>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { query } = router;
  const { page, limit } = query;

  const { data: dataUser } = useQuery<DataUser, PostgrestError>(
    [
      QUERY_KEY_USERS,
      {
        ...query,
        page: Number(page),
        limit: Number(limit),
      },
    ],
    getUsers
  );

  const {
    register,
    getValues,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      ...query,
    },
  });

  useEffect(() => {
    getTotalUsers().then(setTotalUsers);
    getTotalUsersUpload().then(setTotalUsersUpload);
    getTotalUsersAdmin().then(setTotalUsersAdmin);
  }, []);

  useEffect(() => {
    if (
      isNull(totalUsers) ||
      isNull(totalUsersUpload) ||
      isNull(totalUsersAdmin)
    )
      return;
    setLoading(false);
  }, [totalUsers, totalUsersUpload, totalUsersAdmin]);

  const handleSeach = () => {
    const { email } = getValues();

    if (!isDirty) return;
    router.replace({
      pathname: "/admin/users",
      query: {
        page,
        limit,
        ...(email ? { email } : undefined),
      },
    });
  };

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <Section title={t("list_user")}>
          <div className="flex flex-col md:flex-row gap-4">
            <StatisticBox
              title={t("total_user")}
              Icon={FaUsers}
              value={totalUsers}
            />
            <StatisticBox
              title={t("total_uploader")}
              Icon={FaUserEdit}
              value={totalUsersUpload}
            />
            <StatisticBox
              title={t("total_admin")}
              Icon={FaUserCog}
              value={totalUsersAdmin}
            />
          </div>
          <Section hasPadding={false} className="flex items-center">
            <Input
              {...register("email")}
              containerInputClassName="border border-white/80"
              LeftIcon={AiOutlineSearch}
              label={t("email")}
              containerClassName="w-full md:w-1/3 mb-8"
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
            <UsersTable
              user={user}
              users={dataUser?.users}
              totalUser={dataUser?.count}
            />
          </Section>
        </Section>
      )}
    </AdminLayout>
  );
};

const getUsers = async ({ queryKey }) => {
  const [_, params] = queryKey;
  const { page, limit, email } = params;

  // @ts-ignore
  let query = supabase
    .from("users")
    .select("*, sources: kaguya_sources(*)", { count: "exact" })
    .range(page * limit, page * limit + limit - 1);

  if (email?.length) {
    const textQuery = `%${email.toLowerCase()}%`;
    query = query.ilike("email", textQuery);
  }

  const { data: users, count } = await query;

  return { users, count };
};

const getTotalUsers = async () => {
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact" });

  return count;
};

const getTotalUsersUpload = async () => {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("isVerified", true);

  return count;
};
const getTotalUsersAdmin = async () => {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("authRole", "admin");

  return count;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx;

  if (isEmpty(query)) {
    return {
      redirect: {
        destination: "/admin/users?page=0&limit=10",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default withAuthAdmin(Users);
