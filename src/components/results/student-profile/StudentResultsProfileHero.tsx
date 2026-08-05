import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  FileText,
  GraduationCap,
  Phone,
  UserRound,
} from "lucide-react";

import type {
  StudentResultProfileData,
} from "@/lib/results";

export default function StudentResultsProfileHero({
  student,
  totalResults,
}: {
  student:
    StudentResultProfileData["student"];

  totalResults: number;
}) {
  const fullName =
    `${student.name} ${student.surname}`;

  return (
    <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.24)] sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/list/results/manage"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Results
          </Link>

          <Link
            href={`/list/report-cards/create?studentId=${student.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-500"
          >
            <FileText className="h-4 w-4" />
            Generate Report Card
          </Link>
        </div>

        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {student.img ? (
              <Image
                src={student.img}
                alt={fullName}
                width={112}
                height={112}
                className="h-28 w-28 rounded-[28px] object-cover ring-4 ring-white/10"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-blue-600 text-3xl font-black">
                {student.name.charAt(0)}
                {student.surname.charAt(0)}
              </div>
            )}

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                Student Results Profile
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {fullName}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <ProfileTag
                  icon={UserRound}
                  text={student.studentID}
                />

                <ProfileTag
                  icon={GraduationCap}
                  text={`${student.class.name} • ${student.grade.level}`}
                />

                {student.parent ? (
                  <ProfileTag
                    icon={Phone}
                    text={`${student.parent.name} ${student.parent.surname} • ${student.parent.phone}`}
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 text-center backdrop-blur">
            <p className="text-4xl font-black">
              {totalResults}
            </p>

            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Filtered Results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileTag({
  icon: Icon,
  text,
}: {
  icon: typeof UserRound;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}