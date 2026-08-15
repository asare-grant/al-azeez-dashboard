import {
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import CustomRoleEditor from "@/components/access-control/CustomRoleEditor";

import {
  getAccessControlRoleDetail,
} from "@/lib/access-control/admin-dashboard";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function EditAccessRolePage({
  params,
}: {
  params:
    Promise<{
      roleId:
        string;
    }>;
}) {
  const {
    roleId,
  } =
    await params;

  const numericRoleId =
    Number(
      roleId,
    );

  if (
    !Number.isInteger(
      numericRoleId,
    ) ||
    numericRoleId <=
      0
  ) {
    notFound();
  }

  const data =
    await getAccessControlRoleDetail(
      numericRoleId,
    );

  if (
    !data
  ) {
    notFound();
  }

  const {
    role,
  } =
    data;

  /*
   * Protected/system roles should never receive
   * an editable route even if someone manually
   * types the URL.
   */
  if (
    role.isProtected ||
    role.type ===
      "SYSTEM"
  ) {
    redirect(
      `/list/access-control/roles/${role.id}`,
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* ====================================================== */}
        {/* BACK                                                   */}
        {/* ====================================================== */}

        <Link
          href={`/list/access-control/roles/${role.id}`}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Role
        </Link>

        <AccessControlTabs />

        {/* ====================================================== */}
        {/* HERO                                                   */}
        {/* ====================================================== */}

        <section className="relative mt-6 overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.17em] text-violet-200 sm:text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />

              Custom Role Administration
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Edit {role.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Update this custom access profile and carefully control the
              capabilities inherited by every assigned user.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200">
              <LockKeyhole className="h-4 w-4" />

              Permission changes are recorded in the access audit trail
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* EDITOR                                                 */}
        {/* ====================================================== */}

        <div className="mt-6">
          <CustomRoleEditor
            role={{
              id:
                role.id,

              key:
                role.key,

              name:
                role.name,

              description:
                role.description,

              type:
                role.type,

              isProtected:
                role.isProtected,

              isActive:
                role.isActive,

              permissionCount:
                role.permissionCount,
            }}
            permissionGroups={
              data.permissionGroups
            }
          />
        </div>
      </div>
    </div>
  );
}