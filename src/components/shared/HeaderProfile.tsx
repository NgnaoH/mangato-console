import Avatar from "@/components/shared/Avatar";
import Button from "@/components/shared/Button";
import Popup from "@/components/shared/Popup";
import TextIcon from "@/components/shared/TextIcon";
import { useTranslation } from "next-i18next";
import React from "react";
import { HiOutlineLogout } from "react-icons/hi";
import Link from "next/link";
import { AiOutlineProject, AiOutlineUpload } from "react-icons/ai";
import { AdditionalUser } from "@/types";
import { supabase, useSupabaseSingleQuery } from "@/utils/supabase";

interface HeaderProfileProps {
  user: AdditionalUser;
  logOut: any;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({ user, logOut }) => {
  const { t } = useTranslation("header");

  const { data: additionData } = useSupabaseSingleQuery("additionUser", () => {
    return supabase.from("users").select("*").eq("id", user.id).single();
  });

  if (!user) return null;
  return (
    <Popup
      type="click"
      placement="bottom-start"
      offset={[3.5, 10]}
      showArrow
      reference={<Avatar src={user.user_metadata.avatar_url} />}
    >
      <div className="flex items-center mb-8 space-x-2">
        <Avatar src={user.user_metadata.avatar_url} className="!w-14 !h-14" />

        <div>
          <p className="font-semibold">
            {user.user_metadata.full_name || user.user_metadata.name}
          </p>
          <p className="text-gray-300 text-sm">{t("user")}</p>
        </div>
      </div>

      <div className="space-y-2">
        {additionData?.authRole === "admin" && (
          <Link href="/admin">
            <a>
              <Button className="w-full" secondary>
                <TextIcon LeftIcon={AiOutlineProject}>Admin</TextIcon>
              </Button>
            </a>
          </Link>
        )}
        {!additionData?.deactived && (
          <Link href="/upload">
            <a>
              <Button className="w-full mt-2" secondary>
                <TextIcon LeftIcon={AiOutlineUpload}>Upload</TextIcon>
              </Button>
            </a>
          </Link>
        )}
        <Button
          className="w-full !bg-transparent hover:!bg-white/20"
          onClick={logOut}
        >
          <TextIcon LeftIcon={HiOutlineLogout}>
            <p>{t("logout")}</p>
          </TextIcon>
        </Button>
      </div>
    </Popup>
  );
};

export default React.memo(HeaderProfile);
