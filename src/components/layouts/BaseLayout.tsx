import React from "react";
import Footer from "@/components/partials/Footer";
import Header from "@/components/partials/Header";
import { useRouter } from "next/router";

interface BaseLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  showFooter = true,
  showHeader = true,
}) => {
  const { pathname } = useRouter();

  return (
    <main>
      {showHeader && <Header />}

      <div className="app">{children}</div>

      {showFooter &&
        !(pathname.includes("admin") || pathname.includes("upload")) && (
          <Footer />
        )}
    </main>
  );
};

export default BaseLayout;
