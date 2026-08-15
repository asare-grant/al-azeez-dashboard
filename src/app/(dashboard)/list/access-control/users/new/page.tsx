import { ArrowLeft, ShieldCheck, UserRoundPlus } from "lucide-react";

import Link from "next/link";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import CreateUserWizard from "@/components/access-control/create-user/CreateUserWizard";

import { getCreateUserWizardData } from "@/lib/access-control/admin-dashboard";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function CreateAccessUserPage() {
  const data = await getCreateUserWizardData();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/list/access-control/users"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Users Directory
        </Link>

        <AccessControlTabs />

        <section className="relative mt-6 overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.25)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.17em] text-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Identity Provisioning
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Create School User
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Provision authentication, school identity and role-based access
              through one controlled administrative workflow.
            </p>
          </div>
        </section>

        <div className="mt-6">
          <CreateUserWizard
            roles={data.roles}
            classes={data.classes}
            subjects={data.subjects}
            parents={data.parents}
            students={data.students}
          />
        </div>
      </div>
    </div>
  );
}
