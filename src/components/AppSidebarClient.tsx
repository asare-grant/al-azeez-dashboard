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
  FileText,
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
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function AppSidebarClient({
  role,
  name,
  imageUrl,
}: {
  role: string;
  name: string;
  imageUrl: string;
}) {
  const menuItems = [
    {
      icon: <Home size={18} className="text-blue-600" />,
      label: "Dashboard",
      href: "/admin",
      visible: ["admin", "teacher", "student", "parent"],
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

  const menuLinkClass = (href: string) =>
    `flex items-center gap-3 rounded-md transition-all duration-200 ${
      path === href
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 text-blue-700 shadow-sm"
        : "hover:bg-slate-100"
    }`;

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
                              path === menuItem.href
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
                              path === academic.href
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

        {/* FINANCE COLLAPSIBLE */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Finance
                <ChevronDown
                  size={16}
                  className="ml-auto text-green-500 transition-transform group-data-[state=open]/collapsible:rotate-180"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {finances.map(
                    (finance) =>
                      finance.visible.includes(role) && (
                        <SidebarMenuItem key={finance.label}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={finance.href}
                              className={menuLinkClass(finance.href)}
                            >
                              {/* <img src={finance.icon} alt={finance.label} className="w-4 h-4" /> */}
                              <span
                                className={`transition-all duration-300 ${
                                  path === finance.href
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
                      ),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

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
                              path === information.href
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
                    <Link href="/list/settings/term">
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
