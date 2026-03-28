import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | FurnSpace",
  description: "FurnSpace Admin Panel",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:gap-8">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
