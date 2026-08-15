import {
  ArrowLeft,
  Copy,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import CustomRoleBuilder from "@/components/access-control/CustomRoleBuilder";

import {
  getCustomRoleBuilderData,
} from "@/lib/access-control/admin-dashboard";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function CreateCustomRolePage({
  searchParams,
}: {
  searchParams:
    Promise<{
      clone?:
        string;
    }>;
}) {
  const params =
    await searchParams;

  const cloneRoleId =
    params.clone
      ? Number(
          params.clone,
        )
      : undefined;

  const data =
    await getCustomRoleBuilderData({
      cloneRoleId:
        Number.isInteger(
          cloneRoleId,
        )
          ? cloneRoleId
          : undefined,
    });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/list/access-control/roles"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />

          Roles & Permissions
        </Link>

        <AccessControlTabs />

        <section className="relative mt-6 overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.17em] text-violet-200">
              {data.sourceRole ? (
                <Copy className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}

              {data.sourceRole
                ? "Role Blueprint"
                : "Custom Authorization"}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              {data.sourceRole
                ? `Create from ${data.sourceRole.name}`
                : "Create Custom Role"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              {data.sourceRole
                ? "Create a safe custom copy of an existing access profile without modifying the original role."
                : "Build a specialized school access profile using the central permission catalogue."}
            </p>
          </div>
        </section>

        <div className="mt-6">
          <CustomRoleBuilder
            permissionGroups={
              data.permissionGroups
            }
            sourceRole={
              data.sourceRole
            }
          />
        </div>
      </div>
    </div>
  );
}