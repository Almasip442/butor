import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | FurnSpace",
  description: "FurnSpace Admin Panel",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-var(--header-height,5rem))] bg-muted/10">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
