// lib/reports.ts
import prisma from "@/lib/prisma";

/* -----------------------------------------------
   CLASS REPORT (PAGINATED)
------------------------------------------------ */
export const getClassReport = async (page: number, perPage: number) => {
  const [classes, count] = await prisma.$transaction([
    prisma.class.findMany({
      include: {
        students: {
          include: {
            feeMasters: { include: { payments: true } },
          },
        },
      },
      skip: perPage * (page - 1),
      take: perPage,
    }),
    prisma.class.count(),
  ]);

  const result = classes.map((cls) => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    const studentCount = cls.students.length;

    for (const student of cls.students) {
      for (const fm of student.feeMasters) {
        const invoiced = fm.totalAmount ?? 0;
        const paid = fm.payments.reduce((s, p) => s + (p.amount ?? 0), 0);

        totalInvoiced += invoiced;
        totalPaid += paid;
        totalPending += invoiced - paid;
      }
    }

    return {
      classId: cls.id,
      className: cls.name,
      totalInvoiced,
      totalPaid,
      totalPending,
      avgFeePerStudent: studentCount ? totalInvoiced / studentCount : 0,
    };
  });

  return { result, count };
};

/* -----------------------------------------------
   TERM REPORT (PAGINATED)
------------------------------------------------ */
export const getTermReport = async (page: number, perPage: number) => {
  // 1. Fetch ALL grouped rows (Prisma does not allow skip/take here)
  const groups = await prisma.feeMaster.groupBy({
    by: ["term", "academicYear"],
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: {
      academicYear: "desc", // REQUIRED
    },
  });

  const count = groups.length;

  // 2. Manual pagination
  const paginated = groups.slice(perPage * (page - 1), perPage * page);

  // 3. Format
  const result = paginated.map((g) => ({
    term: g.term,
    academicYear: g.academicYear,
    totalInvoiced: g._sum.totalAmount ?? 0,
    totalInvoices: g._count.id,
  }));

  return { result, count };
};


/* -----------------------------------------------
   STUDENT REPORT (PAGINATED)
------------------------------------------------ */
export const getStudentReport = async (page: number, perPage: number) => {
  const students = await prisma.student.findMany({
    include: {
      feeMasters: { include: { payments: true } },
    },
  });

  const allRows: any[] = [];

  for (const student of students) {
    for (const fm of student.feeMasters) {
      const paid = fm.payments.reduce((s, p) => s + (p.amount ?? 0), 0);
      const pending = (fm.totalAmount ?? 0) - paid;

      let status = "PENDING";
      if (paid === 0) status = "PENDING";
      else if (pending > 0) status = "PARTIAL";
      else status = "PAID";

      allRows.push({
        studentId: student.id,
        studentName: `${student.name} ${student.surname}`,
        invoiceId: fm.id,
        term: fm.term,
        academicYear: fm.academicYear,
        totalAmount: fm.totalAmount,
        paid,
        pending,
        status,
      });
    }
  }

  const count = allRows.length;

  const result = allRows.slice(perPage * (page - 1), perPage * page);

  return { result, count };
};
