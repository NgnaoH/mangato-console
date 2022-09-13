import { AdditionalUser, Chapter, Report } from "@/types";
import { useTranslation } from "next-i18next";
import React, { useRef } from "react";
import { MdSettings } from "react-icons/md";
import Button from "./Button";
import Modal, { ModalRef } from "./Modal";
import Dot from "@/components/shared/Dot";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import Image from "@/components/shared/Image";
import { typeReport } from "./ReportConfirmation";
import { BsCheck, BsPlus } from "react-icons/bs";
import { AiOutlineSearch } from "react-icons/ai";
import Link from "next/link";
import { multilangStatusCons } from "@/constants";

interface ReportModalProps {
  report: Report;
  updateReport: Function;
  isUpdating: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({
  report,
  updateReport,
  isUpdating,
}) => {
  const { t } = useTranslation("admin");
  const { locale } = useRouter();

  const modalRef = useRef<ModalRef>();

  const handleSave = () => {
    // updateReport({ userId: user.id, isUploader, isAdmin, deactived });
  };
  const handleModalState = (state: "open" | "close") => () => {
    if (state === "open") {
      modalRef.current.open();
    } else if (state === "close") {
      modalRef.current.close();
    }
  };

  return (
    <React.Fragment>
      <Button
        onClick={handleModalState("open")}
        secondary
        className="w-full"
        LeftIcon={MdSettings}
      />

      <Modal ref={modalRef}>
        <h1 className="text-2xl font-semibold">
          {t("report_detail")}
          <Dot className="mx-2" />
          <span className="text-lg text-gray-300">
            {dayjs(report.created_at, { locale }).fromNow()}
          </span>
        </h1>
        <div className="space-y-4 my-8">
          <div className="flex items-center">
            <p>
              {t("type_report")}: {t(report.type)}
            </p>
          </div>
          <div className="flex items-center">
            <p className="mr-2">{t("reporter")}:</p>
            <ShowUser t={t} user={report.reporter} />
          </div>

          <div className="flex items-center">
            <p className="mr-2">{t("target_reported")}:</p>
            {report.type === typeReport.user && (
              <ShowUser t={t} user={report.user} />
            )}
            {report.type === typeReport.chapter && (
              <ShowChapter t={t} chapter={report.chapter} />
            )}
          </div>

          {report.type === typeReport.chapter && (
            <div className="flex items-center">
              <p className="mr-2">{t("uploader")}:</p>
              <ShowUser t={t} user={report.chapter.uploader} />
            </div>
          )}
        </div>
        <div className="flex items-center">
          <p className="mr-2">
            {t("reason")}: {report.reason}
          </p>
        </div>
      </Modal>
    </React.Fragment>
  );
};

interface ShowUserProps {
  t: Function;
  user: AdditionalUser;
}
const ShowUser: React.FC<ShowUserProps> = ({ t, user }) => {
  const role = {
    admin: t("admin"),
    user: t("uploader"),
    norUser: t("user"),
  };

  const router = useRouter();

  return (
    <div className="flex items-center">
      <span className="p-2 shrink-0 relative w-10 h-10 rounded-full inline-block">
        <Image
          layout="fill"
          className="rounded-full"
          src={user.user_metadata.avatar_url ?? "/fallback_profile.png"}
          alt="avatar"
        />
      </span>
      <Dot className="mx-2" />
      <span className="text-white">{user.user_metadata.full_name}</span>
      <Dot className="mx-2" />
      <span className="text-white">{user.email}</span>
      <Dot className="mx-2" />
      <span className="text-white">
        {user.isVerified ? role[user.authRole] : role.norUser}
      </span>
      <Dot className="mx-2" />
      <Link
        href={{
          pathname: "/admin/users",
          query: { email: user.email, page: 0, limit: 10 },
        }}
      >
        <a>
          <AiOutlineSearch size={24} />
        </a>
      </Link>
    </div>
  );
};

interface ShowChapterProps {
  t: Function;
  chapter: Chapter;
}
const ShowChapter: React.FC<ShowChapterProps> = ({ t, chapter }) => {
  const { locale } = useRouter();

  return (
    <div className="flex items-center">
      <span className="text-white">{chapter.name}</span>
      <Dot className="mx-2" />
      <span className="text-white">
        {dayjs(chapter.created_at, { locale }).fromNow()}
      </span>
      <Dot className="mx-2" />
      {chapter.multilang === multilangStatusCons.ready ? (
        <span className="text-white flex items-center">
          {t("multi_lang_available")}
          <BsCheck className="text-green-500" size={32} />
        </span>
      ) : (
        <span className="text-white flex">
          {t("multi_lang_unavailable")}
          <BsPlus className="text-red-500 origin-center rotate-45" size={32} />
        </span>
      )}
      <Dot className="mx-2" />
      <Link
        href={{
          pathname: "/admin/chapters",
          query: { name: chapter.name, page: 0, limit: 10 },
        }}
      >
        <a>
          <AiOutlineSearch size={24} />
        </a>
      </Link>
    </div>
  );
};

export default ReportModal;
