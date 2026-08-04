import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const DashboardLayout = () => (
  <SidebarProvider>
    <DashboardSidebar />
    <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
      <DashboardHeader />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  </SidebarProvider>
);

export default DashboardLayout;
