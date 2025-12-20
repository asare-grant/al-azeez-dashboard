import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ select: { id: true } });
  console.log("Seeding attendance for", students.length, "students");

  for (let i = 0; i < students.length; i++) {
    const studentId = students[i].id;
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: Math.random() > 0.3,
        day: (i % 5) + 1, // example day
        studentId,
      },
    });
  }

  console.log("Attendance seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
