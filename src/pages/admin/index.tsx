import AdminLayout from "@/components/layouts/AdminLayout";
import Loading from "@/components/shared/Loading";
import Section from "@/components/shared/Section";
import StatisticBox from "@/components/shared/StatisticBox";
import withAuthAdmin from "@/hocs/withAuthAdmin";
import { supabase } from "@/utils/supabase";
import { isNull } from "lodash";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { FaImages, FaUsersCog } from "react-icons/fa";
import { GoReport } from "react-icons/go";

const Admin = ({ user, sourceId }) => {
  const [totalUsers, setTotalUsers] = useState<number>(null);
  const [totalReports, setTotalReports] = useState<number>(null);
  const [totalChapters, setTotalChapters] = useState<number>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("admin");

  useEffect(() => {
    getTotalChapters().then(setTotalChapters);
    getTotalUsers().then(setTotalUsers);
    getTotalReports().then(setTotalReports);
  }, [sourceId]);

  useEffect(() => {
    if (isNull(totalUsers) || isNull(totalReports)) return;
    setLoading(false);
  }, [totalUsers, totalReports]);

  return (
    <AdminLayout>
      <Section
        title={`Hi, ${
          user.user_metadata.full_name || user.user_metadata.name
        }!`}
      >
        {loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <StatisticBox
              title="Số người dùng"
              Icon={FaUsersCog}
              value={totalUsers}
            />
            <StatisticBox
              title="Số báo cáo"
              Icon={GoReport}
              value={totalReports}
            />
            <StatisticBox
              title={t("total_chapter")}
              Icon={FaImages}
              value={totalChapters}
            />
          </div>
        )}
      </Section>
    </AdminLayout>
  );
};

const getTotalChapters = async () => {
  const { count } = await supabase
    .from("kaguya_chapters")
    .select("slug", { count: "exact" });

  return count;
};

const getTotalUsers = async () => {
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact" });

  return count;
};

const getTotalReports = async () => {
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact" });

  return count;
};

export default withAuthAdmin(Admin);
