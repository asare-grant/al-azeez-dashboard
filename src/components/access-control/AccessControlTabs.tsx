"use client";

import Link from "next/link";

import {
  Activity,
  KeyRound,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

const tabs = [
  {
    label:
      "Overview",

    href:
      "/list/access-control",

    icon:
      LayoutDashboard,

    exact:
      true,
  },

  {
    label:
      "Users",

    href:
      "/list/access-control/users",

    icon:
      UsersRound,
  },

  {
    label:
      "Roles & Permissions",

    href:
      "/list/access-control/roles",

    icon:
      KeyRound,
  },

  {
    label:
      "Access Activity",

    href:
      "/list/access-control/activity",

    icon:
      Activity,
  },
];

export default function AccessControlTabs() {
  const pathname =
    usePathname();

  return (
    <nav className="mt-6 overflow-x-auto rounded-[20px] border border-slate-200 bg-white p-1.5 shadow-sm">
      <div className="flex min-w-max gap-1">
        {tabs.map(
          (
            tab,
          ) => {
            const Icon =
              tab.icon;

            const active =
              tab.exact
                ? pathname ===
                  tab.href
                : pathname.startsWith(
                    tab.href,
                  );

            return (
              <Link
                key={
                  tab.href
                }
                href={
                  tab.href
                }
                className={`group inline-flex h-11 items-center gap-2 rounded-[14px] px-4 text-sm font-black transition-all duration-200 ${
                  active
                    ? "bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.14)]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active
                      ? "text-blue-300"
                      : "text-slate-400 transition group-hover:text-slate-700"
                  }`}
                />

                {
                  tab.label
                }
              </Link>
            );
          },
        )}
      </div>
    </nav>
  );
}