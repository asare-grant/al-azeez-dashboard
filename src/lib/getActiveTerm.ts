import prisma from "@/lib/prisma";

export const getActiveTerm = async () => {
  return prisma.schoolTerm.findFirst({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });
};
