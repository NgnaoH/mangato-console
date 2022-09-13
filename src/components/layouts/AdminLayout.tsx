import Head from "@/components/shared/Head";
import Logo from "@/components/shared/Logo";
import NavItem from "@/components/shared/NavItem";
import useDevice from "@/hooks/useDevice";
import classNames from "classnames";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BiLogOutCircle } from "react-icons/bi";
import { FaImages, FaUsersCog } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { GoReport } from "react-icons/go";

const routes = [
  {
    title: "Trang chủ",
    href: "/admin",
    icon: AiOutlineHome,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: FaUsersCog,
  },
  {
    title: "Chapters",
    href: "/admin/chapters",
    icon: FaImages,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: GoReport,
  },
];

const variants: Variants = {
  animate: {
    x: 0,
  },
  initial: {
    x: "-100%",
  },
};

const AdminLayout: React.FC = ({ children }) => {
  const { isMobile } = useDevice();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex justify-end">
      <Head title="Upload - Kaguya" />

      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <AnimatePresence initial={isMobile}>
        <motion.div
          variants={variants}
          transition={{ ease: "linear" }}
          animate={!isMobile || isMenuOpen ? "animate" : ""}
          initial="initial"
          className="h-full w-[70vw] md:w-[20vw] fixed top-0 left-0 bottom-0 z-50 flex flex-col justify-between bg-background-900 p-4"
        >
          <div>
            <Logo />
            <ul>
              {routes.map((route) => (
                <NavItem
                  className="block mb-2"
                  href={route.href}
                  key={route.href}
                >
                  {({ isActive }) => (
                    <li
                      className={classNames(
                        "flex items-center space-x-2 transition duration-300 font-semibold px-3 py-2 cursor-pointer rounded-md",
                        isActive ? "bg-white/20" : "hover:bg-white/20"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <route.icon className="w-6 h-6" />

                      <p>{route.title}</p>
                    </li>
                  )}
                </NavItem>
              ))}
            </ul>
          </div>

          <Link href="/">
            <a className="w-full">
              <li
                className={classNames(
                  "flex items-center space-x-2 hover:bg-white/20 transition duration-300 font-semibold px-3 py-2 cursor-pointer rounded-md"
                )}
              >
                <BiLogOutCircle className="w-6 h-6" />

                <p>Quay về trang chủ</p>
              </li>
            </a>
          </Link>
        </motion.div>
      </AnimatePresence>

      <div className="w-full md:w-4/5 pt-16 pb-4 md:py-12">
        {isMobile && (
          <GiHamburgerMenu
            className="absolute top-4 left-4 w-8 h-8"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          />
        )}

        <div className="relative w-full h-full space-y-8">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
