import { ReadPanelContextProvider } from "@/contexts/ReadPanelContext";
import { User } from "@supabase/supabase-js";
import React from "react";
import Sidebar from "./Sidebar";
import ViewPanel from "./ViewPanel";

interface ReadPanelProps {
  children: React.ReactNode;
  user: User;
}

const ReadPanel: React.FC<ReadPanelProps> = ({ children, user }) => {
  return (
    <ReadPanelContextProvider>
      <div className="flex w-full h-screen overflow-y-hidden">
        {user && <Sidebar user={user} />}
        <ViewPanel>{children}</ViewPanel>
      </div>
    </ReadPanelContextProvider>
  );
};

export default ReadPanel;
