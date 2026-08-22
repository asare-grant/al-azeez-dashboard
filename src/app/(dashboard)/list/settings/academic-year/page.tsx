// src/app/(dashboard)/list/settings/academic-year/page.tsx

import AcademicYearForm from "@/components/forms/AcademicYearForm";

import {
  requirePermission,
} from "@/lib/access-control";

import prisma from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function AcademicYearSettingsPage() {
  /* ------------------------------------------------------------------------ */
  /* AUTHORIZATION                                                            */
  /* ------------------------------------------------------------------------ */

  /*
   * Academic-year configuration changes affect the
   * entire academic platform, so this workspace requires
   * the settings management capability.
   */
  await requirePermission(
    "settings.manage",
  );

  /* ------------------------------------------------------------------------ */
  /* DATA                                                                     */
  /* ------------------------------------------------------------------------ */

  const academicYears =
    await prisma.schoolAcademicYear.findMany({
      orderBy: [
        {
          isActive:
            "desc",
        },

        {
          startDate:
            "desc",
        },
      ],
    });

  const activeAcademicYear =
    academicYears.find(
      (year) =>
        year.isActive,
    );

  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <h1 className="mb-2 text-2xl font-semibold">
        Academic Year Settings
      </h1>

      <p className="mb-6 text-sm text-slate-500">
        Configure the school academic year used across assessments,
        weightings, examinations and report cards.
      </p>

      <AcademicYearForm
        data={
          activeAcademicYear
        }
        academicYears={
          academicYears
        }
      />
    </div>
  );
}