import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";

import prisma from "@/lib/prisma";

import {
  getParentChildUnifiedResults,
} from "@/lib/results";

import StudentResultsPage from "@/components/results/StudentResultsPage";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type ParentChildResultsPageProps = {
  params: Promise<{
    childId: string;
  }>;
};

export default async function ParentChildResultsPage({
  params,
}: ParentChildResultsPageProps) {
  const {
    childId,
  } = await params;

  if (
    !childId.trim()
  ) {
    notFound();
  }

  const [
    data,
    terms,
  ] =
    await Promise.all([
      getParentChildUnifiedResults({
        childId,
      }),

      prisma.schoolTerm.findMany({
        select: {
          id:
            true,

          name:
            true,

          isActive:
            true,
        },

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
      }),
    ]);

  if (!data) {
    notFound();
  }

  return (
    <div>
      <StudentResultsPage
        studentName={`${data.child.name} ${data.child.surname}`}
        results={
          data.results
        }
        terms={
          terms
        }
        mode="parent"
      />
    </div>
  );
}