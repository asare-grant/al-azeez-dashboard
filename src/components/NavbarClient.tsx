// src/components/NavbarClient.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

import {
  ChevronRight,
  CircleHelp,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarTrigger } from "./ui/sidebar";
import Themespage from "./Themespage";

import { useEffect, useState, type ReactNode } from "react";

import {
  formatRoleLabel,
  getRoleDashboardPath,
  normalizeAppRole,
} from "@/lib/navigation/roles";

interface NavbarClientProps {
  username: string;
  name: string;
  firstName: string;
  role: string;
  imageUrl: string;
  notificationBell: ReactNode;

  canViewSettings: boolean;
}

const NavbarClient = ({
  username,
  name,
  firstName,
  role,
  imageUrl,
  notificationBell,
  canViewSettings,
}: NavbarClientProps) => {
  const { signOut } = useClerk();

  const router = useRouter();
  const path = usePathname();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(path);
  }, [path]);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await signOut();

      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const formattedRole = formatRoleLabel(role);

  return (
    <div className="flex items-center justify-between p-4">
      {/* ======================================================== */}
      {/* LEFT SIDE                                                */}
      {/* ======================================================== */}

      <SidebarTrigger />

      {/* ======================================================== */}
      {/* RIGHT SIDE                                               */}
      {/* ======================================================== */}

      <div className="flex items-center gap-2 sm:gap-3">
        {/* THEME */}

        <Themespage />

        {/* NOTIFICATIONS */}

        {notificationBell}

        {/* ====================================================== */}
        {/* DESKTOP USER SUMMARY                                   */}
        {/* ====================================================== */}

        <div className="hidden flex-col items-end md:flex">
          <span className="max-w-[140px] truncate text-xs font-bold leading-4 text-slate-800">
            {firstName}
          </span>

          <span className="mt-0.5 text-[10px] font-semibold capitalize text-slate-400">
            {formattedRole}
          </span>
        </div>

        {/* ====================================================== */}
        {/* PREMIUM PROFILE MENU                                   */}
        {/* ====================================================== */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              className="group relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {/* subtle hover ring */}

              <span className="absolute inset-0 rounded-full bg-slate-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-50" />

              <Avatar className="relative h-9 w-9 border-2 border-white shadow-[0_4px_14px_rgba(15,23,42,0.12)]">
                <AvatarImage
                  src={imageUrl}
                  alt={name}
                  className="object-cover"
                />

                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-[11px] font-black text-white">
                  {initials || "UI"}
                </AvatarFallback>
              </Avatar>

              {/* online/status indicator */}

              <span className="absolute bottom-[2px] right-[1px] h-3 w-3 rounded-full border-[2.5px] border-white bg-emerald-500 shadow-sm" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={12}
            className="
              mr-2
              w-[calc(100vw-24px)]
              max-w-[370px]
              overflow-hidden
              rounded-[24px]
              border
              border-slate-200/80
              bg-white
              p-0
              shadow-[0_24px_70px_rgba(15,23,42,0.20)]
              sm:mr-4
              sm:w-[370px]
            "
          >
            {/* ================================================== */}
            {/* ACCOUNT CARD                                       */}
            {/* ================================================== */}

            <div className="p-3">
              <div className="rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-[0_8px_25px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3 rounded-[15px] px-2 py-2">
                  <Avatar className="h-12 w-12 shrink-0 border-2 border-white shadow-[0_4px_16px_rgba(15,23,42,0.12)]">
                    <AvatarImage
                      src={imageUrl}
                      alt={name}
                      className="object-cover"
                    />

                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-black text-white">
                      {initials || "UI"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-black tracking-[-0.01em] text-slate-900">
                      {name}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-blue-700">
                        {formattedRole}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                      <span className="truncate text-[10px] font-medium text-slate-400">
                        {username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACCOUNT BUTTON */}

                <Link
                  href={getRoleDashboardPath(normalizeAppRole(role))}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-black text-slate-700 transition-all duration-200 hover:bg-slate-200 hover:text-slate-950"
                >
                  <UserRound className="h-4 w-4" />
                  View your dashboard
                </Link>
              </div>
            </div>

            {/* ================================================== */}
            {/* MENU ITEMS                                          */}
            {/* ================================================== */}

            <div className="px-2 pb-2">
              {canViewSettings && (
                <PremiumMenuItem
                  href="/list/settings/academic-calendar"
                  icon={Settings}
                  title="Settings"
                  description="Manage school configuration"
                />
              )}

              <PremiumMenuItem
                href="/notifications/settings"
                icon={ShieldCheck}
                title="Notification Preferences"
                description="Control alerts and quiet hours"
              />

              <PremiumMenuItem
                href="/notifications"
                icon={CircleHelp}
                title="Notification Centre"
                description="View your school communications"
              />

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
                  p-2.5
                  outline-none
                  transition-colors
                  duration-200
                  focus:bg-red-50
                  data-[highlighted]:bg-red-50
                "
              >
                <div className="flex w-full items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors group-hover:bg-red-100 group-hover:text-red-600 sm:h-10 sm:w-10">
                    <LogOut className="h-[18px] w-[18px]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-red-700">
                      {loading ? "Signing out..." : "Log out"}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                      End your current session
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-400" />
                </div>
              </DropdownMenuItem>
            </div>

            {/* ================================================== */}
            {/* AAIS FOOTER — KEEPING YOUR EXISTING IDENTITY        */}
            {/* ================================================== */}

            <DropdownMenuSeparator className="m-0 bg-slate-100" />

            <div className="relative overflow-hidden px-4 py-3.5">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavbarClient;

/* ================================================================ */
/* PREMIUM MENU ITEM                                                */
/* ================================================================ */

function PremiumMenuItem({
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
        outline-none
        transition-colors
        duration-200
        focus:bg-slate-100
        data-[highlighted]:bg-slate-100
      "
    >
      <Link
        href={href}
        className="flex w-full items-center gap-2.5 p-2.5 sm:gap-3 sm:p-3"
      >
        <span className="flex h-9 w-9 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all duration-200 group-hover:bg-slate-200 group-hover:text-slate-950">
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
