import type {
  LucideIcon,
} from "lucide-react";

import {
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  FileCog,
  FilePlus2,
  FileSearch,
  FileText,
  GraduationCap,
  Home,
  Layers3,
  Scale,
  School,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import type {
  AppRole,
} from "./roles";

import {
  getRoleDashboardPath,
} from "./roles";

export type SidebarNavigationItem = {
  label: string;

  href:
    | string
    | ((role: AppRole) => string);

  icon: LucideIcon;

  roles: AppRole[];

  exact?: boolean;
};

export type SidebarNavigationGroup = {
  label: string;

  items:
    SidebarNavigationItem[];
};

export const sidebarNavigationGroups:
  SidebarNavigationGroup[] = [
  {
    label: "Home",

    items: [
      {
        label: "Dashboard",

        href:
          getRoleDashboardPath,

        icon:
          Home,

        roles: [
          "admin",
          "teacher",
          "student",
          "parent",
          "account",
        ],

        exact:
          true,
      },

      {
        label: "Teachers",
        href: "/list/teachers",
        icon: UserRound,

        roles: [
          "admin",
          "teacher",
          "account",
        ],
      },

      {
        label: "Students",
        href: "/list/students",
        icon: GraduationCap,

        roles: [
          "admin",
          "teacher",
          "account",
        ],
      },

      {
        label: "Parents",
        href: "/list/parents",
        icon: Users,

        roles: [
          "admin",
          "teacher",
        ],
      },
    ],
  },

  {
    label: "Academics",

    items: [
      {
        label: "Subjects",
        href: "/list/subjects",
        icon: BookOpenCheck,

        roles: [
          "admin",
        ],
      },

      {
        label: "Classes",
        href: "/list/classes",
        icon: School,

        roles: [
          "admin",
          "teacher",
          "account",
        ],
      },

      {
        label: "Results",
        href: "/list/results",
        icon: BarChart3,

        roles: [
          "admin",
          "teacher",
          "student",
          "parent",
        ],
      },
    ],
  },

  {
    label: "Report Cards",

    items: [
      {
        label:
          "Report Command Centre",

        href: (role) => {
          switch (role) {
            case "admin":
              return "/list/report-cards";

            case "teacher":
              return "/teacher/classes";

            case "student":
              return "/student/report-cards";

            case "parent":
              return "/parent/children";

            default:
              return "/";
          }
        },

        icon:
          FileText,

        roles: [
          "admin",
          "teacher",
          "student",
          "parent",
        ],
      },

      {
        label:
          "Generate Reports",

        href:
          "/list/report-cards/generate",

        icon:
          FilePlus2,

        roles: [
          "admin",
        ],
      },

      {
        label:
          "Bulk Review",

        href:
          "/list/report-cards/review",

        icon:
          ClipboardCheck,

        roles: [
          "admin",
        ],
      },

      {
        label:
          "Teacher Classes",

        href:
          "/teacher/classes",

        icon:
          Layers3,

        roles: [
          "teacher",
        ],
      },

      {
        label:
          "My Report Cards",

        href:
          "/student/report-cards",

        icon:
          FileSearch,

        roles: [
          "student",
        ],
      },

      {
        label:
          "Children's Reports",

        href:
          "/parent/children",

        icon:
          ShieldCheck,

        roles: [
          "parent",
        ],
      },
    ],
  },

  {
    label: "Academic Settings",

    items: [
      {
        label:
          "Academic Weighting",

        href:
          "/list/academic-settings/weightings",

        icon:
          Scale,

        roles: [
          "admin",
        ],
      },

      {
        label:
          "Grading Scales",

        href:
          "/list/academic-settings/grading-scales",

        icon:
          FileCog,

        roles: [
          "admin",
        ],
      },

      {
        label:
          "Term Settings",

        href:
          "/list/settings/academic-calendar",

        icon:
          Settings2,

        roles: [
          "admin",
        ],
      },
    ],
  },
];