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
  BellRing,
  ServerCog,
  Folder,
  FolderArchive,
  GraduationCap,
  Home,
  InfoIcon,
  ChevronRight,
  CircleHelp,
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
  username,
  imageUrl,
}: {
  role: AppRole;

  name: string;

  username: string;

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

  const communications = [
    {
      icon: <BellRing size={18} className="text-violet-600" />,

      label: "Notifications",

      href: "/notifications",

      visible: ["admin", "teacher", "student", "parent", "account"],
    },
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
    {
      icon: <ServerCog size={18} className="text-cyan-600" />,

      label: "Notification Operations",

      href: "/list/notification-operations",

      visible: ["admin"],
    },
  ];

  const { signOut } = useClerk();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();

    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  const handleLogout = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await signOut();

      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const path = usePathname();
  useEffect(() => {
    console.log(path);
  }, [path]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

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

        {/* COMMUNICATIONS */}
        {/* COMMUNICATIONS */}
        <Collapsible
          defaultOpen={
            path.startsWith("/notifications") ||
            path.startsWith("/list/events") ||
            path.startsWith("/list/announcements") ||
            path.startsWith("/list/messages") ||
            path.startsWith("/list/notification-operations")
          }
          className="group/communications"
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Communications
                <ChevronDown
                  size={16}
                  className="ml-auto text-violet-500 transition-transform group-data-[state=open]/communications:rotate-180"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {communications.map((item) =>
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
      </SidebarContent>

      {/* ========================================================== */}
      {/* PREMIUM SIDEBAR ACCOUNT FOOTER                             */}
      {/* ========================================================== */}

      <SidebarFooter className="border-t border-slate-200/80 bg-white/80 p-2 backdrop-blur-xl">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              {/* ==================================================== */}
              {/* TRIGGER                                              */}
              {/* ==================================================== */}

              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="
              group
              h-auto
              rounded-[18px]
              border
              border-transparent
              px-2
              py-2
              transition-all
              duration-300
              hover:border-slate-200
              hover:bg-slate-50
              hover:shadow-sm
              data-[state=open]:border-blue-100
              data-[state=open]:bg-blue-50/60
            "
                >
                  {/* AVATAR */}

                  <div className="relative shrink-0">
                    <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
                      <Image
                        src={imageUrl}
                        alt={name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>

                  {/* IDENTITY */}

                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-black text-slate-800">
                      {name}
                    </span>

                    <span className="mt-0.5 truncate text-[10px] font-bold capitalize text-slate-400">
                      {formattedRole}
                    </span>
                  </div>

                  <ChevronUp className="ml-auto h-4 w-4 text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {/* ==================================================== */}
              {/* DROPDOWN                                             */}
              {/* ==================================================== */}

              <DropdownMenuContent
                side={isMobileViewport ? "top" : "right"}
                align={isMobileViewport ? "start" : "end"}
                sideOffset={isMobileViewport ? 8 : 12}
                collisionPadding={12}
                avoidCollisions
                className="
                  flex
                  max-h-[calc(100dvh-24px)]
                  w-[350px]
                  max-w-[calc(100vw-24px)]
                  flex-col
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-slate-200/80
                  bg-white
                  p-0
                  shadow-[0_25px_80px_rgba(15,23,42,0.20)]

                  max-sm:w-[calc(100vw-24px)]
                  max-sm:max-w-[360px]
                  max-sm:rounded-[22px]

                  sm:w-[350px]
                "
              >
                {/* ================================================== */}
                {/* PROFILE CARD                                       */}
                {/* ================================================== */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className="p-3">
                    <div className="rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-[0_8px_26px_rgba(15,23,42,0.07)]">
                      <div className="flex items-center gap-3 px-1 py-1">
                        {/* LARGE AVATAR */}

                        <div className="relative shrink-0">
                          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-[0_5px_16px_rgba(15,23,42,0.14)]">
                            <Image
                              src={imageUrl}
                              alt={name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-[2.5px] border-white bg-emerald-500" />
                        </div>

                        {/* USER DETAILS */}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-black tracking-[-0.01em] text-slate-950">
                            {name}
                          </p>

                          <div className="mt-1.5 flex min-w-0 items-center gap-2">
                            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-blue-700">
                              {formattedRole}
                            </span>

                            {username ? (
                              <>
                                <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

                                <span className="truncate text-[10px] font-semibold text-slate-400">
                                  {username}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* DASHBOARD */}

                      <Link
                        href={getRoleDashboardPath(role)}
                        className="
                  mt-3
                  flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-slate-100
                  text-xs
                  font-black
                  text-slate-700
                  transition-all
                  duration-200
                  hover:bg-slate-200
                  hover:text-slate-950
                "
                      >
                        <Home className="h-4 w-4" />
                        View your dashboard
                      </Link>
                    </div>
                  </div>

                  {/* ================================================== */}
                  {/* ACCOUNT ACTIONS                                    */}
                  {/* ================================================== */}

                  <div className="px-2 pb-2">
                    {/* ACCOUNT */}

                    <SidebarAccountMenuItem
                      href="/profile"
                      icon={User2}
                      title="Account"
                      description="View and manage your profile"
                    />

                    {/* NOTIFICATION SETTINGS */}

                    <SidebarAccountMenuItem
                      href="/notifications/settings"
                      icon={Settings2}
                      title="Notification Preferences"
                      description="Alerts, channels and quiet hours"
                    />

                    {/* NOTIFICATION CENTRE */}

                    <SidebarAccountMenuItem
                      href="/notifications"
                      icon={BellRing}
                      title="Notification Centre"
                      description="View school communications"
                    />

                    {/* ADMIN SETTINGS */}

                    {role === "admin" ? (
                      <SidebarAccountMenuItem
                        href="/list/settings"
                        icon={Settings}
                        title="School Settings"
                        description="Manage application configuration"
                      />
                    ) : null}

                    {/* LOGOUT */}

                    <DropdownMenuItem
                      disabled={loading}
                      onSelect={(event) => {
                        event.preventDefault();

                        void handleLogout();
                      }}
                      className="
                group
                cursor-pointer
                rounded-[16px]
                p-3
                transition-colors
                focus:bg-red-50
                data-[highlighted]:bg-red-50
              "
                    >
                      <div className="flex w-full items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors group-hover:bg-red-100 group-hover:text-red-600">
                          <LogOutIcon className="h-[18px] w-[18px]" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-red-700">
                            {loading ? "Signing out..." : "Sign out"}
                          </p>

                          <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                            End your current session
                          </p>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-red-400" />
                      </div>
                    </DropdownMenuItem>
                  </div>

                  {/* ================================================== */}
                  {/* AAIS FOOTER                                        */}
                  {/* ================================================== */}

                  <div className="relative overflow-hidden border-t border-slate-100 px-4 py-3.5">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-blue-50/60" />

                    <div className="relative flex items-center justify-center gap-2">
                      <div className="flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                        <Image
                          src="/logo.jpg"
                          alt="AAIS"
                          width={22}
                          height={22}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <p className="text-[10px] font-semibold text-slate-400">
                        Powered & Managed by{" "}
                        <span className="font-black tracking-wide text-indigo-500">
                          AAIS
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarAccountMenuItem({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;

  icon: typeof Settings;

  title: string;

  description: string;
}) {
  return (
    <DropdownMenuItem
      asChild
      className="
        group
        cursor-pointer
        rounded-[16px]
        p-0
        transition-colors
        focus:bg-slate-100
        data-[highlighted]:bg-slate-100
      "
    >
      <Link href={href} className="flex w-full items-center gap-3 p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all duration-200 group-hover:bg-slate-200 group-hover:text-slate-950">
          <Icon className="h-[18px] w-[18px]" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">{title}</p>

          <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
            {description}
          </p>
        </div>

        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </Link>
    </DropdownMenuItem>
  );
}
