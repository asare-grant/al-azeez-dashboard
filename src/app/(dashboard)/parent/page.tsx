import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import StudentFeeCards from "@/components/StudentFeeCards";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// 🔹 Helper
const getFeeSummary = (feeMaster?: any) => {
  if (!feeMaster) {
    return {
      total: 0,
      paid: 0,
      balance: 0,
    };
  }

  const paid = feeMaster.payments.reduce(
    (sum: number, p: any) => sum + p.amount,
    0,
  );

  return {
    total: feeMaster.totalAmount,
    paid,
    balance: feeMaster.totalAmount - paid,
  };
};

const ParentPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const activeTerm = await prisma.schoolTerm.findFirst({
    where: {
      isActive: true,

      academicYear: {
        isNot: null,
      },
    },

    select: {
      id: true,

      name: true,

      academicYear: {
        select: {
          name: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  const activeTermLabel = activeTerm
    ? activeTerm.name === "FIRST"
      ? "First Term"
      : activeTerm.name === "SECOND"
        ? "Second Term"
        : "Third Term"
    : null;

  const activeAcademicYear = activeTerm?.academicYear?.name ?? null;

  const students = await prisma.student.findMany({
    where: {
      parentId: userId,
    },

    include: {
      class: {
        include: {
          lessons: {
            include: {
              teacher: true,

              assignments: true,
            },
          },
        },
      },

      feeMasters:
        activeTermLabel && activeAcademicYear
          ? {
              where: {
                term: activeTermLabel,

                academicYear: activeAcademicYear,
              },

              include: {
                payments: true,
              },

              take: 1,
            }
          : {
              orderBy: {
                createdAt: "desc",
              },

              include: {
                payments: true,
              },

              take: 1,
            },
    },
  });

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {students.map((student) => {
          const feeMaster = student.feeMasters[0];
          const { total, paid, balance } = getFeeSummary(feeMaster);

          return (
            <div className="w-full mb-6" key={student.id}>
              <div className="h-full bg-white p-4 rounded-md">
                <h1 className="text-xl font-semibold mb-2">
                  Schedule ({student.name} {student.surname})
                </h1>

                {/* 🔹 FEES */}
                <StudentFeeCards
                  studentId={student.id}
                  total={total}
                  paid={paid}
                  balance={balance}
                  feeMaster={feeMaster}
                />

                {/* 🔹 CALENDAR */}
                <div className="mt-6">
                  <BigCalendarContainer lessons={student.class.lessons} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
