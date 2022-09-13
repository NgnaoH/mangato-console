import React from "react";
import Logo from "@/components/shared/Logo";

const Footer = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center px-4 md:px-12 py-16 space-y-4">
      <Logo className="!mb-0" />
    </div>
  );
};

export default Footer;
