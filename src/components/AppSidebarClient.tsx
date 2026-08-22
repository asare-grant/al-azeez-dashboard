// src/components/AppSidebarClient.tsx
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
  Activity,
  CalendarClock,
  KeyRound,
  Shield,
  ShieldCheck,
  UserCog,
  UsersRound,
  UserCircle2Icon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

import { formatRoleLabel, getRoleDashboardPath } from "@/lib/navigation/roles";

import type { AppRole } from "@/lib/navigation/roles";

import {
  canSeeSidebarItem,
  type SidebarAccessRule,
} from "@/lib/navigation/sidebar-access";

export default function AppSidebarClient({
  role,
  roleKey,
  name,
  username,
  imageUrl,
  permissions,
}: {
  role: AppRole;

  roleKey: string;

  name: string;

  username: string;

  imageUrl: string;

  permissions: string[];
}) {
  /* ======================================================================== */
  /* NAVIGATION VISIBILITY                                                    */
  /* ======================================================================== */
  const effectivePermissions = new Set(
    permissions.map((permission) => permission.trim().toLowerCase()),
  );

  function canSee(rule: SidebarAccessRule) {
    return canSeeSidebarItem({
      role,

      permissions: effectivePermissions,

      rule,
    });
  }

  /* ========================================================================== */
  /* OVERVIEW                                                                   */
  /* ========================================================================== */

  const overviewItems = [
    {
      icon: <Home size={18} className="text-blue-600" />,

      label: "Dashboard",

      href: getRoleDashboardPath(role),

      access: {
        authenticated: true,
      } satisfies SidebarAccessRule,
    },
  ];

  /* ========================================================================== */
  /* PEOPLE                                                                     */
  /* ========================================================================== */

  const peopleItems = [
    {
      icon: <UserRound size={18} className="text-emerald-600" />,
      label: "Teachers",
      href: "/list/teachers",

      access: {
        permissionPrefixes: ["teachers."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <GraduationCap size={18} className="text-violet-600" />,
      label: "Students",
      href: "/list/students",

      access: {
        permissionPrefixes: ["students."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Users size={18} className="text-orange-500" />,
      label: "Parents & Guardians",
      href: "/list/parents",

      access: {
        permissionPrefixes: ["parents."],
      } satisfies SidebarAccessRule,
    },
  ];

  /* ========================================================================== */
  /* ACADEMICS                                                                  */
  /* ========================================================================== */

  const academicItems = [
    {
      icon: <BookOpenCheck size={18} className="text-indigo-600" />,
      label: "Subjects",
      href: "/list/subjects",

      // Subjects
      access: {
        anyPermissions: [
          "academics.subjects.view",
          "academics.subjects.manage",
        ],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <School size={18} className="text-sky-600" />,
      label: "Classes",
      href: "/list/classes",

      // Classes
      access: {
        anyPermissions: ["academics.classes.view", "academics.classes.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <NotebookTabs size={18} className="text-amber-500" />,
      label: "Lessons",
      href: "/list/lessons",

      // Lessons
      access: {
        anyPermissions: ["academics.lessons.view", "academics.lessons.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <FileCheck2 size={18} className="text-rose-500" />,
      label: "Exams",
      href: "/list/exams",

      // Exams
      access: {
        anyPermissions: ["exams.view", "exams.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <ClipboardList size={18} className="text-cyan-600" />,
      label: "Assignments",
      href: "/list/assignments",

      // Assignments
      access: {
        anyPermissions: ["assignments.view", "assignments.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <ClipboardList size={18} className="text-amber-500" />,
      label: "Assessments",

      href:
        role === "student"
          ? "/student/assessments"
          : role === "parent"
            ? "/parent/assessments"
            : "/list/assessments",

      access: {
        personas: ["student", "parent"],

        anyPermissions: [
          "assessments.view",
          "assessments.create",
          "assessments.publish",
          "assessments.grade",
        ],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <ClipboardCheck size={18} className="text-green-600" />,
      label: "Attendance",
      href: "/list/attendance",

      access: {
        anyPermissions: [
          "attendance.view",
          "attendance.record",
          "attendance.modify",
          "attendance.report",
        ],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <BarChart3 size={18} className="text-purple-600" />,
      label: "Results",
      href: "/list/results",

      // Results
      access: {
        anyPermissions: ["results.view", "results.manage"],
      } satisfies SidebarAccessRule,
    },
  ];

  /* ========================================================================== */
  /* REPORTING & PERFORMANCE                                                    */
  /* ========================================================================== */

  const reportingItems = [
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

      access: {
        personas: ["student", "parent", "teacher"],

        anyPermissions: [
          "report_cards.view",
          "report_cards.edit",
          "report_cards.submit",
          "report_cards.review",
          "report_cards.publish",
        ],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <FilePlus2 size={18} className="text-emerald-600" />,
      label: "Generate Reports",
      href: "/list/report-cards/generate",

      access: {
        anyPermissions: ["report_cards.generate"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <ClipboardCheck size={18} className="text-violet-600" />,
      label: "Bulk Review",
      href: "/list/report-cards/review",

      access: {
        anyPermissions: ["report_cards.review"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Scale size={18} className="text-amber-600" />,
      label: "Academic Weighting",
      href: "/list/academic-settings/weightings",

      access: {
        anyPermissions: ["report_cards.settings"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <FileCog size={18} className="text-cyan-600" />,
      label: "Grading Scales",
      href: "/list/academic-settings/grading-scales",

      access: {
        anyPermissions: ["report_cards.settings"],
      } satisfies SidebarAccessRule,
    },
  ];

  /* ========================================================================== */
  /* FINANCE                                                                    */
  /* ========================================================================== */

  const financeItems = [
    {
      icon: <Wallet size={18} className="text-emerald-600" />,
      label: "Fees",
      href: "/list/fee",

      access: {
        anyPermissions: [
          "finance.invoices.manage",
          "finance.payments.record",
          "finance.payments.modify",
        ],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <LayoutList size={18} className="text-violet-600" />,
      label: "Fee Structure",
      href: "/list/fee-structure",

      access: {
        anyPermissions: ["finance.structure.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Tag size={18} className="text-orange-500" />,
      label: "Fee Type",
      href: "/list/fee-type",

      access: {
        anyPermissions: ["finance.structure.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Folder size={18} className="text-cyan-600" />,
      label: "Fee Category",
      href: "/list/fee-category",

      access: {
        anyPermissions: ["finance.structure.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Database size={18} className="text-indigo-600" />,
      label: "Fee Master",
      href: "/list/fee-master",

      access: {
        anyPermissions: ["finance.structure.manage"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <BarChart3 size={18} className="text-pink-600" />,
      label: "Fee Report",
      href: "/list/fee-report",

      access: {
        anyPermissions: ["finance.reports.view"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <FolderArchive size={18} className="text-amber-500" />,
      label: "Feeding Fees",
      href: "/list/feeding-fees",

      access: {
        anyPermissions: ["finance.payments.record", "finance.payments.modify"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <BusIcon size={18} className="text-sky-600" />,
      label: "Bus Fees",
      href: "/list/bus-fees",

      access: {
        anyPermissions: ["finance.payments.record", "finance.payments.modify"],
      } satisfies SidebarAccessRule,
    },
  ];

  /* ========================================================================== */
  /* COMMUNICATIONS                                                             */
  /* ========================================================================== */

  const communicationItems = [
    {
      icon: <BellRing size={18} className="text-violet-600" />,

      label: "Notifications",

      href: "/notifications",

      access: {
        authenticated: true,
      } satisfies SidebarAccessRule,
    },

    {
      icon: <CalendarDays size={18} className="text-blue-600" />,

      label: "Events",

      href: "/list/events",

      access: {
        permissionPrefixes: ["communications.events."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Megaphone size={18} className="text-orange-500" />,

      label: "Announcements",

      href: "/list/announcements",

      access: {
        permissionPrefixes: ["communications.announcements."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <MessageCircle size={18} className="text-emerald-600" />,

      label: "Messages",

      href: "/list/messages",

      access: {
        anyPermissions: [
          "communications.messages.view",
          "communications.messages.send",
          "communications.messages.manage",
        ],
      } satisfies SidebarAccessRule,
    },
  ];

  /* ========================================================================== */
  /* SECURITY & ADMINISTRATION                                                  */
  /* ========================================================================== */

  const securityItems = [
    {
      icon: <ShieldCheck size={18} className="text-blue-600" />,

      label: "Access Control Centre",

      href: "/list/access-control",

      access: {
        permissionPrefixes: [
          "users.",
          "roles.",
          "permissions.",
          "access_reviews.",
          "audit.",
        ],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <UsersRound size={18} className="text-cyan-600" />,

      label: "Users & Identities",

      href: "/list/access-control/users",

      // Roles & Permissions
      access: {
        permissionPrefixes: ["users."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <KeyRound size={18} className="text-violet-600" />,

      label: "Roles & Permissions",

      href: "/list/access-control/roles",

      access: {
        permissionPrefixes: ["roles.", "permissions."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <CalendarClock size={18} className="text-amber-600" />,

      label: "Delegated Access",

      href: "/list/access-control/delegated-access",

      access: {
        anyPermissions: ["roles.manage_expiry"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Shield size={18} className="text-emerald-600" />,

      label: "Access Reviews",

      href: "/list/access-control/reviews",

      access: {
        permissionPrefixes: ["access_reviews."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Activity size={18} className="text-rose-500" />,

      label: "Access Activity",

      href: "/list/access-control/activity",

      access: {
        anyPermissions: ["audit.view"],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <ServerCog size={18} className="text-cyan-600" />,

      label: "Notification Operations",

      href: "/list/notification-operations",

      access: {
        permissionPrefixes: ["notification_operations."],
      } satisfies SidebarAccessRule,
    },

    {
      icon: <Settings size={18} className="text-slate-600" />,

      label: "School Settings",

      href: "/list/settings",

      access: {
        permissionPrefixes: ["settings."],
      } satisfies SidebarAccessRule,
    },
  ];

  const visibleOverview = overviewItems.filter((item) => canSee(item.access));

  const visiblePeople = peopleItems.filter((item) => canSee(item.access));

  const visibleAcademics = academicItems.filter((item) => canSee(item.access));

  const visibleReporting = reportingItems.filter((item) => canSee(item.access));

  const visibleFinance = financeItems.filter((item) => canSee(item.access));

  const visibleCommunications = communicationItems.filter((item) =>
    canSee(item.access),
  );

  const visibleSecurity = securityItems.filter((item) => canSee(item.access));

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

  const formattedRole = formatRoleLabel(roleKey);

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
     * Access Control overview should only be active on
     * the actual overview page.
     *
     * Its child workspaces have dedicated navigation items.
     */
    if (href === "/list/access-control") {
      return path === "/list/access-control";
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
        {/* ==================================================================== */}
        {/* OVERVIEW                                                             */}
        {/* ==================================================================== */}

        {visibleOverview.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {visibleOverview.map((item) => (
                  <SidebarNavigationItem
                    key={item.label}
                    item={item}
                    routeIsActive={routeIsActive}
                    menuLinkClass={menuLinkClass}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {/* ==================================================================== */}
        {/* PEOPLE                                                               */}
        {/* ==================================================================== */}

        {/* ==================================================================== */}
        {/* PEOPLE                                                               */}
        {/* ==================================================================== */}

        {visiblePeople.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel
              className="
        px-3
        text-[10px]
        font-black
        uppercase
        tracking-[0.14em]
        text-slate-400
        flex justify-between
      "
            >
              Users
              <UserCircle2Icon
                className="
        h-3
        w-3
        text-blue-500
      "
              />
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {visiblePeople.map((item) => (
                  <SidebarNavigationItem
                    key={item.label}
                    item={item}
                    routeIsActive={routeIsActive}
                    menuLinkClass={menuLinkClass}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {/* ==================================================================== */}
        {/* ACADEMICS                                                            */}
        {/* ==================================================================== */}

        {visibleAcademics.length > 0 ? (
          <Collapsible
            defaultOpen={visibleAcademics.some((item) =>
              routeIsActive(item.href),
            )}
            className="group/academics"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Academics
                  <ChevronDown
                    size={16}
                    className="ml-auto text-blue-500 transition-transform group-data-[state=open]/academics:rotate-180"
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleAcademics.map((item) => (
                      <SidebarNavigationItem
                        key={item.label}
                        item={item}
                        routeIsActive={routeIsActive}
                        menuLinkClass={menuLinkClass}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ) : null}

        {/* ==================================================================== */}
        {/* REPORTING & PERFORMANCE                                              */}
        {/* ==================================================================== */}

        {visibleReporting.length > 0 ? (
          <Collapsible
            defaultOpen={
              path.startsWith("/list/report-cards") ||
              path.startsWith("/student/report-cards") ||
              path.startsWith("/parent/children") ||
              path.startsWith("/teacher/classes") ||
              path.startsWith("/list/academic-settings")
            }
            className="group/reporting"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Reporting & Performance
                  <ChevronDown
                    size={16}
                    className="ml-auto text-violet-500 transition-transform group-data-[state=open]/reporting:rotate-180"
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleReporting.map((item) => (
                      <SidebarNavigationItem
                        key={item.label}
                        item={item}
                        routeIsActive={routeIsActive}
                        menuLinkClass={menuLinkClass}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ) : null}

        {/* ==================================================================== */}
        {/* FINANCE                                                              */}
        {/* ==================================================================== */}

        {visibleFinance.length > 0 ? (
          <Collapsible
            defaultOpen={visibleFinance.some((item) =>
              routeIsActive(item.href),
            )}
            className="group/finance"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Finance
                  <ChevronDown
                    size={16}
                    className="ml-auto text-emerald-500 transition-transform group-data-[state=open]/finance:rotate-180"
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleFinance.map((item) => (
                      <SidebarNavigationItem
                        key={item.label}
                        item={item}
                        routeIsActive={routeIsActive}
                        menuLinkClass={menuLinkClass}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ) : null}

        {/* ==================================================================== */}
        {/* COMMUNICATIONS                                                       */}
        {/* ==================================================================== */}

        {visibleCommunications.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel
              className="
        px-3
        text-[10px]
        font-black
        uppercase
        tracking-[0.14em]
        text-slate-400
        flex justify-between
      "
            >
              Communications
              <InfoIcon
                className="
        h-3
        w-3
        text-cyan-300
      "
              />
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {visibleCommunications.map((item) => (
                  <SidebarNavigationItem
                    key={item.label}
                    item={item}
                    routeIsActive={routeIsActive}
                    menuLinkClass={menuLinkClass}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {/* ==================================================================== */}
        {/* SECURITY & ADMINISTRATION                                            */}
        {/* ==================================================================== */}

        {visibleSecurity.length > 0 ? (
          <Collapsible
            defaultOpen={
              path.startsWith("/list/access-control") ||
              path.startsWith("/list/notification-operations") ||
              path.startsWith("/list/settings")
            }
            className="group/security"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Security & Administration
                  <ChevronDown
                    size={16}
                    className="ml-auto text-rose-500 transition-transform group-data-[state=open]/security:rotate-180"
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleSecurity.map((item) => (
                      <SidebarNavigationItem
                        key={item.label}
                        item={item}
                        routeIsActive={routeIsActive}
                        menuLinkClass={menuLinkClass}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ) : null}
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

                    {canSee({
                      permissionPrefixes: ["settings."],
                    }) ? (
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

function SidebarNavigationItem({
  item,
  routeIsActive,
  menuLinkClass,
}: {
  item: {
    icon: React.ReactNode;

    label: string;

    href: string;
  };

  routeIsActive: (href: string) => boolean;

  menuLinkClass: (href: string) => string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          href={item.href}
          className={`
            ${menuLinkClass(item.href)}
            min-h-9
            px-4.5
          `}
        >
          <span
            className={`transition-all duration-300 ${
              routeIsActive(item.href) ? "scale-110 drop-shadow-md" : ""
            }`}
          >
            {item.icon}
          </span>

          <span
            className="
              truncate
              text-[13px]
              font-medium
            "
          >
            {item.label}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
