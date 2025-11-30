"use client";

import React from "react";
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
import { BookOpen, ChevronDown, ChevronUp, InfoIcon, User2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    { icon: "/home.png", label: "Dashboard", href: "/admin", visible: ["admin", "teacher", "student", "parent"] },
    { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
    { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
    { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
  ];

  const academics = [
    { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
    { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
    { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
    { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
    { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
    { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
    { icon: "/attendance.png", label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
  ];

  const finances = [
    { icon: "/attendance.png", label: "Fees", href: "/list/fee", visible: ["admin"] },
    { icon: "/subject.png", label: "Fee Structure", href: "/list/fee-structure", visible: ["admin"] },
    { icon: "/subject.png", label: "Fee Type", href: "/list/fee-type", visible: ["admin"] },
    { icon: "/subject.png", label: "Fee Category", href: "/list/fee-category", visible: ["admin"] },
    { icon: "/subject.png", label: "Fee Master", href: "/list/fee-master", visible: ["admin"] },
    { icon: "/subject.png", label: "Fee Report", href: "/list/fee-report", visible: ["admin"] },
  ];

  const informations = [
    { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
    { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
    { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
  ];

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
                        <Link href={menuItem.href} className="flex items-center gap-3">
                          <img src={menuItem.icon} alt={menuItem.label} className="w-4 h-4" />
                          <span>{menuItem.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ACADEMICS */}
        <SidebarGroup>
          <SidebarGroupLabel>Academics</SidebarGroupLabel>
          <SidebarGroupAction>
            <BookOpen />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {academics.map(
                (academic) =>
                  academic.visible.includes(role) && (
                    <SidebarMenuItem key={academic.label}>
                      <SidebarMenuButton asChild>
                        <Link href={academic.href} className="flex items-center gap-3">
                          <img src={academic.icon} alt={academic.label} className="w-4 h-4" />
                          <span>{academic.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
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
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
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
                            <Link href={finance.href} className="flex items-center gap-3">
                              <img src={finance.icon} alt={finance.label} className="w-4 h-4" />
                              <span>{finance.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
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
            <InfoIcon />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {informations.map(
                (information) =>
                  information.visible.includes(role) && (
                    <SidebarMenuItem key={information.label}>
                      <SidebarMenuButton asChild>
                        <Link href={information.href} className="flex items-center gap-3">
                          <img src={information.icon} alt={information.label} className="w-4 h-4" />
                          <span>{information.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
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
                  <Link href="/profile">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sign-out">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
