import Button from "@/components/shared/Button";
import Drawer, { DrawerRef } from "@/components/shared/Drawer";
import HeaderProfile from "@/components/shared/HeaderProfile";
import Logo from "@/components/shared/Logo";
import NavItem from "@/components/shared/NavItem";
import { DISCORD_URL, FACEBOOK_URL } from "@/constants";
import useUser from "@/hooks/useUser";
import { AdditionalUser } from "@/types";
import { supabase } from "@/utils/supabase";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AiFillFacebook, AiOutlineSearch } from "react-icons/ai";
import { FaDiscord } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import Notifications from "../features/notifications/Notifications";
import LanguageSwitcher from "../shared/LanguageSwitcher";
import Section from "../shared/Section";

const routes = [
  // {
  //   title: "Anime",
  //   href: "/",
  // },
  {
    title: "Manga",
    href: "/manga",
  },
  // {
  //   title: "anime_scene_search",
  //   href: "/scene-search",
  // },
  // {
  //   title: "watch_with_friends",
  //   href: "/wwf",
  // },
  // {
  //   title: "Anime Themes",
  //   href: "/themes",
  // },
];

const Header = () => {
  const [isTop, setIsTop] = useState(true);
  const [isLoged, setIsLoged] = useState(false);
  const drawerRef = useRef<DrawerRef>();
  const { user, additionUser, isLoading } = useUser();
  const router = useRouter();
  const { t } = useTranslation("header");

  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY === 0);
    };

    document.addEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsLoged(!!user);
  }, [user]);

  const logOut = async () => {
    await supabase.auth.signOut().then(() => {
      setIsLoged(false);
    });
    router.reload();
  };

  return (
    <>
      <Section
        className={classNames(
          "px-4 md:px-12 flex items-center h-16 fixed top w-full z-50 transition duration-500",
          !isTop
            ? "bg-background"
            : "bg-gradient-to-b from-black/80 via-black/60 to-transparent",
          additionUser?.deactived ? "top-12" : ""
        )}
      >
        <Drawer
          ref={drawerRef}
          containerClassName="sm:hidden mr-4"
          className="flex justify-between flex-col py-8"
          button={<GiHamburgerMenu className="w-6 h-6" />}
        >
          <div>
            <Logo />

            <div className="space-y-2">
              {routes.map((route) => (
                <div onClick={drawerRef.current?.close} key={route.href}>
                  <NavItem className="block" href={route.href}>
                    {({ isActive }) => (
                      <p
                        className={classNames(
                          "pl-4 border-l-4 font-semibold text-2xl",
                          isActive
                            ? "border-primary-500 text-white"
                            : "border-background-900 text-typography-secondary"
                        )}
                      >
                        {t(route.title)}
                      </p>
                    )}
                  </NavItem>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <ContactItem href={DISCORD_URL} Icon={FaDiscord} />
              <ContactItem href={FACEBOOK_URL} Icon={AiFillFacebook} />
            </div>
          </div>
        </Drawer>

        <div className="relative h-2/3 w-10 mr-8">
          <NavItem href="/">
            {() => <Logo className="!w-full !h-full" />}
          </NavItem>
        </div>

        <div className="hidden sm:flex items-center space-x-6 font-semibold text-typography-secondary">
          {routes.map((route) => (
            <NavItem href={route.href} key={route.href}>
              {({ isActive }) => (
                <p
                  className={classNames(
                    "hover:text-white transition duration-300",
                    isActive && "text-primary-300"
                  )}
                >
                  {t(route.title)}
                </p>
              )}
            </NavItem>
          ))}
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          <LanguageSwitcher />
          <Notifications />

          <NavItem href="/browse?type=manga">
            {({ isActive }) => (
              <AiOutlineSearch
                className={classNames(
                  "w-7 h-7 font-semibold hover:text-primary-300 transition duration-300",
                  isActive && "text-primary-300"
                )}
              />
            )}
          </NavItem>
          {console.log(isLoading)}
          {!isLoading && (
            <>
              {isLoged ? (
                <HeaderProfile user={user} logOut={logOut} />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href={`/login?redirectedFrom=${router.asPath}`}>
                    <a>
                      <Button primary>
                        <p className="line-clamp-1">{t("login")}</p>
                      </Button>
                    </a>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </Section>
      {additionUser?.deactived && (
        <Section
          className={classNames(
            "px-4 md:px-12 flex items-center justify-center h-12 fixed top w-full z-50 bg-red-500"
          )}
        >
          <div className="hidden sm:flex items-center space-x-6 font-semibold text-typography-secondary">
            Tài khoản này đã bị hạn chế
          </div>
        </Section>
      )}
    </>
  );
};

const ContactItem: React.FC<{
  Icon: any;
  href: string;
}> = ({ Icon, href }) => {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <Icon className="w-6 h-6 hover:text-primary-300 transition duration-300" />
    </a>
  );
};

export default React.memo(Header);
