"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  BusIcon,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileCheck2,
  Folder,
  FolderArchive,
  GraduationCap,
  Home,
  InfoIcon,
  LayoutList,
  LogOutIcon,
  Megaphone,
  MessageCircle,
  NotebookTabs,
  School,
  Settings,
  Tag,
  User2,
  UserRound,
  Users,
  Wallet,
  FileCog,
  FilePlus2,
  FileSearch,
  FileText,
  Layers3,
  Scale,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import type { AppRole } from "@/lib/navigation/roles";

import { getRoleDashboardPath } from "@/lib/navigation/roles";

export default function AppSidebarClient({
  role,
  name,
  imageUrl,
}: {
  role: AppRole;
  name: string;
  imageUrl: string;
}) {
  const menuItems = [
    {
      icon: <Home size={18} className="text-blue-600" />,
      label: "Dashboard",
      href: getRoleDashboardPath(role),
      visible: ["admin", "teacher", "student", "parent", "account"],
    },
    {
      icon: <UserRound size={18} className="text-emerald-600" />,
      label: "Teachers",
      href: "/list/teachers",
      visible: ["admin", "teacher", "account"],
    },
    {
      icon: <GraduationCap size={18} className="text-violet-600" />,
      label: "Students",
      href: "/list/students",
      visible: ["admin", "teacher", "account"],
    },
    {
      icon: <Users size={18} className="text-orange-500" />,
      label: "Parents",
      href: "/list/parents",
      visible: ["admin", "teacher"],
    },
  ];

  const academics = [
    {
      icon: <BookOpenCheck size={18} className="text-indigo-600" />,
      label: "Subjects",
      href: "/list/subjects",
      visible: ["admin"],
    },
    {
      icon: <School size={18} className="text-sky-600" />,
      label: "Classes",
      href: "/list/classes",
      visible: ["admin", "teacher", "account"],
    },
    {
      icon: <NotebookTabs size={18} className="text-amber-500" />,
      label: "Lessons",
      href: "/list/lessons",
      visible: ["admin", "teacher"],
    },
    {
      icon: <FileCheck2 size={18} className="text-rose-500" />,
      label: "Exams",
      href: "/list/exams",
      visible: ["admin", "teacher", "student", "parent"],
    },
    {
      icon: <ClipboardList size={18} className="text-cyan-600" />,
      label: "Assignments",
      href: "/list/assignments",
      visible: ["admin", "teacher", "student", "parent"],
    },
    {
      icon: <BarChart3 size={18} className="text-purple-600" />,
      label: "Results",
      href: "/list/results",
      visible: ["admin", "teacher", "student", "parent"],
    },
    {
      icon: <ClipboardCheck size={18} className="text-green-600" />,
      label: "Attendance",
      href: "/list/attendance",
      visible: ["admin", "teacher", "account"],
    },
    {
      icon: <ClipboardList size={18} className="text-amber-300" />,
      label: "Assessments",
      href:
        role === "student"
          ? "/student/assessments"
          : role === "parent"
            ? "/parent/assessments"
            : "/list/assessments",
      visible: ["admin", "teacher", "student", "parent"],
    },
  ];

  const reportCards = [
    {
      icon: <FileText size={18} className="text-blue-600" />,

      label:
        role === "student"
          ? "My Report Cards"
          : role === "parent"
            ? "Children's Reports"
            : role === "teacher"
              ? "Class Report Cards"
              : "Report Command Centre",

      href:
        role === "student"
          ? "/student/report-cards"
          : role === "parent"
            ? "/parent/children"
            : role === "teacher"
              ? "/teacher/classes"
              : "/list/report-cards",

      visible: ["admin", "teacher", "student", "parent"],
    },

    {
      icon: <FilePlus2 size={18} className="text-emerald-600" />,

      label: "Generate Reports",

      href: "/list/report-cards/generate",

      visible: ["admin"],
    },

    {
      icon: <ClipboardCheck size={18} className="text-violet-600" />,

      label: "Bulk Review",

      href: "/list/report-cards/review",

      visible: ["admin"],
    },

    {
      icon: <Scale size={18} className="text-amber-600" />,

      label: "Academic Weighting",

      href: "/list/academic-settings/weightings",

      visible: ["admin"],
    },

    {
      icon: <FileCog size={18} className="text-cyan-600" />,

      label: "Grading Scales",

      href: "/list/academic-settings/grading-scales",

      visible: ["admin"],
    },
  ];

  const finances = [
    {
      icon: <Wallet size={18} className="text-emerald-600" />,
      label: "Fees",
      href: "/list/fee",
      visible: ["admin"],
    },
    {
      icon: <LayoutList size={18} className="text-violet-600" />,
      label: "Fee Structure",
      href: "/list/fee-structure",
      visible: ["admin"],
    },
    {
      icon: <Tag size={18} className="text-orange-500" />,
      label: "Fee Type",
      href: "/list/fee-type",
      visible: ["admin"],
    },
    {
      icon: <Folder size={18} className="text-cyan-600" />,
      label: "Fee Category",
      href: "/list/fee-category",
      visible: ["admin"],
    },
    {
      icon: <Database size={18} className="text-indigo-600" />,
      label: "Fee Master",
      href: "/list/fee-master",
      visible: ["admin"],
    },
    {
      icon: <BarChart3 size={18} className="text-pink-600" />,
      label: "Fee Report",
      href: "/list/fee-report",
      visible: ["admin"],
    },
    {
      icon: <FolderArchive size={18} className="text-amber-500" />,
      label: "Feeding Fees",
      href: "/list/feeding-fees",
      visible: ["admin", "account"],
    },
    {
      icon: <BusIcon size={18} className="text-sky-600" />,
      label: "Bus Fees",
      href: "/list/bus-fees",
      visible: ["admin", "account"],
    },
  ];

  const visibleFinances = finances.filter((finance) =>
    finance.visible.includes(role),
  );

  const canSeeFinance = visibleFinances.length > 0;

  const informations = [
    {
      icon: <CalendarDays size={18} className="text-blue-600" />,
      label: "Events",
      href: "/list/events",
      visible: ["admin", "teacher", "student", "parent", "account"],
    },
    {
      icon: <Megaphone size={18} className="text-orange-500" />,
      label: "Announcements",
      href: "/list/announcements",
      visible: ["admin", "teacher", "student", "parent", "account"],
    },
    {
      icon: <MessageCircle size={18} className="text-emerald-600" />,
      label: "Messages",
      href: "/list/messages",
      visible: ["admin", "teacher", "student", "parent", "account"],
    },
  ];

  const { signOut } = useClerk();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    router.push("/sign-in");
  };

  const path = usePathname();
  useEffect(() => {
    console.log(path);
  }, [path]);

  function routeIsActive(href: string, exact = false) {
    /*
     * Exact-match items.
     */
    if (exact) {
      return path === href;
    }

    /*
     * Special handling for the admin Report Card
     * Command Centre.
     *
     * It should stay active for individual report-card
     * detail/review/print pages, but NOT for the dedicated
     * Generate or Bulk Review sections.
     */
    if (href === "/list/report-cards") {
      if (path === "/list/report-cards") {
        return true;
      }

      if (path.startsWith("/list/report-cards/generate")) {
        return false;
      }

      if (path.startsWith("/list/report-cards/review")) {
        return false;
      }

      return path.startsWith("/list/report-cards/");
    }

    /*
     * Dashboard roots should be exact.
     */
    if (
      href === "/admin" ||
      href === "/teacher" ||
      href === "/student" ||
      href === "/parent" ||
      href === "/account"
    ) {
      return path === href;
    }

    /*
     * Normal nested-route matching.
     */
    return path === href || path.startsWith(`${href}/`);
  }

  const menuLinkClass = (href: string) => {
    const active = routeIsActive(href);

    return `flex items-center gap-3 rounded-md transition-all duration-200 ${
      active
        ? "border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
        : "hover:bg-slate-100"
    }`;
  };

  return (
    <Sidebar collapsible="icon">
      {/* SIDEBAR HEADER */}
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="/logo.jpg" alt="logo" width={24} height={24} />
                <span>Al-Azeez International School</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* HOME MENU */}
        <SidebarGroup>
          <SidebarGroupLabel>Home Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(
                (menuItem) =>
                  menuItem.visible.includes(role) && (
                    <SidebarMenuItem key={menuItem.label}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={menuItem.href}
                          className={menuLinkClass(menuItem.href)}
                        >
                          <span
                            className={`transition-all duration-300 ${
                              routeIsActive(menuItem.href)
                                ? "scale-110 drop-shadow-md"
                                : ""
                            }`}
                          >
                            {menuItem.icon}
                          </span>
                          <span>{menuItem.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ACADEMICS */}
        <SidebarGroup>
          <SidebarGroupLabel>Academics</SidebarGroupLabel>
          <SidebarGroupAction>
            <BookOpen size={18} className="text-blue-600" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {academics.map(
                (academic) =>
                  academic.visible.includes(role) && (
                    <SidebarMenuItem key={academic.label}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={academic.href}
                          className={menuLinkClass(academic.href)}
                        >
                          <span
                            className={`transition-all duration-300 ${
                              routeIsActive(academic.href)
                                ? "scale-110 drop-shadow-md"
                                : ""
                            }`}
                          >
                            {academic.icon}
                          </span>
                          <span>{academic.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* REPORT CARDS */}
        <Collapsible
          defaultOpen={
            path.startsWith("/list/report-cards") ||
            path.startsWith("/teacher/classes") ||
            path.startsWith("/student/report-cards") ||
            path.startsWith("/parent/children") ||
            path.startsWith("/list/academic-settings")
          }
          className="group/report-cards"
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Report Cards
                <ChevronDown
                  size={16}
                  className="ml-auto text-blue-500 transition-transform group-data-[state=open]/report-cards:rotate-180"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {reportCards.map((item) =>
                    item.visible.includes(role) ? (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={item.href}
                            className={menuLinkClass(item.href)}
                          >
                            <span
                              className={`transition-all duration-300 ${
                                routeIsActive(item.href)
                                  ? "scale-110 drop-shadow-md"
                                  : ""
                              }`}
                            >
                              {item.icon}
                            </span>

                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ) : null,
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* FINANCE COLLAPSIBLE */}
        {canSeeFinance ? (
          <Collapsible defaultOpen className="group/finance">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Finance
                  <ChevronDown
                    size={16}
                    className="ml-auto text-green-500 transition-transform group-data-[state=open]/finance:rotate-180"
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleFinances.map((finance) => (
                      <SidebarMenuItem key={finance.label}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={finance.href}
                            className={menuLinkClass(finance.href)}
                          >
                            <span
                              className={`transition-all duration-300 ${
                                routeIsActive(finance.href)
                                  ? "scale-110 drop-shadow-md"
                                  : ""
                              }`}
                            >
                              {finance.icon}
                            </span>

                            <span>{finance.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ) : null}

        {/* INFORMATION */}
        <SidebarGroup>
          <SidebarGroupLabel>Information</SidebarGroupLabel>
          <SidebarGroupAction>
            <InfoIcon size={18} className="text-orange-500" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {informations.map(
                (information) =>
                  information.visible.includes(role) && (
                    <SidebarMenuItem key={information.label}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={information.href}
                          className={menuLinkClass(information.href)}
                        >
                          <span
                            className={`transition-all duration-300 ${
                              routeIsActive(information.href)
                                ? "scale-110 drop-shadow-md"
                                : ""
                            }`}
                          >
                            {information.icon}
                          </span>
                          <span>{information.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* SIDEBAR FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex items-center gap-2">
                  <Image
                    // src={"/noAvatar.png"}
                    src={imageUrl}
                    alt={name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="truncate text-[#5d87f8]">{name}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User2 /> Account
                  </Link>
                </DropdownMenuItem>

                {role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/list/settings">
                      <Settings /> Settings
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 cursor-pointer flex items-center gap-2"
                >
                  <LogOutIcon size={16} className="text-red-500" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
