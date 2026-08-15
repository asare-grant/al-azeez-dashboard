import {
  ChevronRight,
  Crown,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

type RoleCardProps = {
  role: {
    id: number;

    key: string;

    name: string;

    description:
      string | null;

    type:
      "SYSTEM" | "CUSTOM";

    isProtected:
      boolean;

    isActive:
      boolean;

    _count: {
      users: number;

      permissions: number;
    };
  };
};

function getRoleIcon(
  roleKey: string,
) {
  switch (
    roleKey
  ) {
    case "admin":
      return Crown;

    case "teacher":
      return ShieldCheck;

    case "student":
      return UserRound;

    case "parent":
      return UsersRound;

    default:
      return KeyRound;
  }
}

export default function RoleCard({
  role,
}: RoleCardProps) {
  const Icon =
    getRoleIcon(
      role.key,
    );

  return (
    <Link
      href={`/list/access-control/roles/${role.id}`}
      className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)] sm:p-6"
    >
      {/* SUBTLE DECORATION */}

      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-50 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${
              role.type ===
              "CUSTOM"
                ? "bg-violet-50 text-violet-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex flex-wrap justify-end gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${
                role.type ===
                "CUSTOM"
                  ? "border-violet-200 bg-violet-50 text-violet-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {role.type ===
              "CUSTOM"
                ? "Custom"
                : "System"}
            </span>

            {role.isProtected ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                <LockKeyhole className="h-2.5 w-2.5" />

                Protected
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black tracking-tight text-slate-950">
              {role.name}
            </h3>

            {!role.isActive ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400">
                Inactive
              </span>
            ) : null}
          </div>

          <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-500">
            {role.description ||
              "Role-based access profile for the school management platform."}
          </p>
        </div>

        {/* METRICS */}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-[16px] border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <UsersRound className="h-3.5 w-3.5" />

              <span className="text-[9px] font-black uppercase tracking-wider">
                Users
              </span>
            </div>

            <p className="mt-2 text-xl font-black text-slate-900">
              {role._count.users}
            </p>
          </div>

          <div className="rounded-[16px] border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <KeyRound className="h-3.5 w-3.5" />

              <span className="text-[9px] font-black uppercase tracking-wider">
                Permissions
              </span>
            </div>

            <p className="mt-2 text-xl font-black text-slate-900">
              {role._count.permissions}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
            {role.isProtected ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

                Core access role
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />

                Configurable role
              </>
            )}
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-600 group-hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}