import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div className="h-screen flex">
      <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          {/* RIGHT */}
          <div className="w-full overflow-scroll bg-[#F7F8FA]">
            <Navbar />
            {children}
          </div>
      </SidebarProvider>
    </div>
  );
}
