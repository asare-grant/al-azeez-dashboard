"use client";

import {
  Clock3,
  KeyRound,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserDirectoryActions({
  userId,
}: {
  userId:
    string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user actions"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[230px] rounded-[16px] border-slate-200 p-1.5 shadow-xl"
      >
        <DropdownMenuItem
          asChild
          className="rounded-xl p-0"
        >
          <Link
            href={`/list/access-control/users/${userId}`}
            className="flex w-full items-center gap-3 px-3 py-2.5"
          >
            <UserRound className="h-4 w-4 text-blue-600" />

            <span className="text-sm font-bold">
              View account
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="rounded-xl p-0"
        >
          <Link
            href={`/list/access-control/users/${userId}?panel=roles`}
            className="flex w-full items-center gap-3 px-3 py-2.5"
          >
            <KeyRound className="h-4 w-4 text-violet-600" />

            <span className="text-sm font-bold">
              Roles & access
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled
          className="rounded-xl px-3 py-2.5"
        >
          <ShieldCheck className="mr-3 h-4 w-4 text-slate-400" />

          <span className="text-sm font-bold">
            Change status
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled
          className="rounded-xl px-3 py-2.5"
        >
          <Clock3 className="mr-3 h-4 w-4 text-slate-400" />

          <span className="text-sm font-bold">
            Access activity
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}