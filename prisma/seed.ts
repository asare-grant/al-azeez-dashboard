import { Day, PrismaClient, UserSex, ResultType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // -------------------- ADMIN --------------------
  await prisma.admin.createMany({ skipDuplicates: true,
    data: [
      { id: "admin1", username: "admin1" },
      { id: "admin2", username: "admin2" },
    ],
  });

  // -------------------- GRADE --------------------
  const grades = [
    "Creche 1",
    "Nursery 1",
    "Nursery 2",
    "KG 1",
    "KG 2",
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "Basic 7",
    "Basic 8",
    "Basic 9",
  ];

  // Create all grades with STRING level
  const gradeRecords: Record<string, number> = {};

  for (const level of grades) {
    const g = await prisma.grade.create({
      data: { level },
    });
    gradeRecords[level] = g.id;
  }

  // -------------------- CLASS --------------------
  const classNames = [
    "Creche 1",
    "Nursery 1",
    "Nursery 2",
    "KG 1",
    "KG 2",
    "Basic 1A",
    "Basic 1B",
    "Basic 2A",
    "Basic 2B",
    "Basic 3A",
    "Basic 3B",
    "Basic 4A",
    "Basic 4B",
    "Basic 5A",
    "Basic 5B",
    "Basic 6A",
    "Basic 6B",
    "Basic 7A",
    "Basic 7B",
    "Basic 8A",
    "Basic 8B",
    "Basic 9A",
    "Basic 9B",
  ];

  const classToGrade: Record<string, string> = {
    "Creche 1": "Creche 1",
    "Nursery 1": "Nursery 1",
    "Nursery 2": "Nursery 2",
    "KG 1": "KG 1",
    "KG 2": "KG 2",
    "Basic 1A": "Basic 1",
    "Basic 1B": "Basic 1",
    "Basic 2A": "Basic 2",
    "Basic 2B": "Basic 2",
    "Basic 3A": "Basic 3",
    "Basic 3B": "Basic 3",
    "Basic 4A": "Basic 4",
    "Basic 4B": "Basic 4",
    "Basic 5A": "Basic 5",
    "Basic 5B": "Basic 5",
    "Basic 6A": "Basic 6",
    "Basic 6B": "Basic 6",
    "Basic 7A": "Basic 7",
    "Basic 7B": "Basic 7",
    "Basic 8A": "Basic 8",
    "Basic 8B": "Basic 8",
    "Basic 9A": "Basic 9",
    "Basic 9B": "Basic 9",
  };

  for (const name of classNames) {
    await prisma.class.create({
      data: {
        name,
        capacity: 40,
        gradeId: gradeRecords[classToGrade[name]],
      },
    });
  }

  // -------------------- SUBJECT --------------------
  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
    "History",
    "Creative Arts",
    "Career Technology",
    "Religious & Moral Education",
    "Computing",
    "French",
    "Arabic",
  ];

  for (const name of subjects) {
    await prisma.subject.create({ data: { name } });
  }

  // -------------------- TEACHER --------------------
  for (let i = 1; i <= 15; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: (i % subjects.length) + 1 }] },
        classes: { connect: [{ id: (i % classNames.length) + 1 }] },
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
      },
    });
  }

  // -------------------- PARENT --------------------
  for (let i = 1; i <= 25; i++) {
    await prisma.parent.create({
      data: {
        id: `parent${i}`,
        username: `parent${i}`,
        name: `PName${i}`,
        surname: `PSurname${i}`,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
      },
    });
  }

  // -------------------- STUDENT --------------------
  for (let i = 1; i <= 50; i++) {
    const assignedClassId = (i % classNames.length) + 1;

    const classData = await prisma.class.findUnique({
      where: { id: assignedClassId },
      include: { grade: true },
    });

    const studentType = i % 2 === 0 ? "new" : "old";
    const boardingType = i % 3 === 0 ? "boarder" : "day";

    await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: `parent${((i - 1) % 25) + 1}`,
        classId: assignedClassId,
        gradeId: classData!.gradeId,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
        studentType,
        boardingType,
      },
    });
  }

  // -------------------- LESSON --------------------
  for (let i = 1; i <= 30; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson ${i}`,
        day: Day[Object.keys(Day)[Math.floor(Math.random() * Object.keys(Day).length)] as keyof typeof Day],
        startTime: new Date(new Date().setHours(9)),
        endTime: new Date(new Date().setHours(11)),
        subjectId: (i % subjects.length) + 1,
        classId: (i % classNames.length) + 1,
        teacherId: `teacher${(i % 15) + 1}`,
      },
    });
  }

  // -------------------- EXAM --------------------
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // -------------------- ASSIGNMENT --------------------
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // -------------------- RESULT --------------------
  for (let i = 1; i <= 10; i++) {
    const isExam = i <= 5;
    await prisma.result.create({
      data: {
        score: 60 + Math.floor(Math.random() * 40),
        type: isExam ? ResultType.EXAM : ResultType.ASSIGNMENT,
        studentId: `student${i}`,
        examId: isExam ? i : null,
        assignmentId: !isExam ? i - 5 : null,
      },
    });
  }
  
//   // ----------------- ATTENDANCE ------------------------

// const studentAttendance = await prisma.student.findMany({ select: { id: true } });

// const attendanceData: { date: Date; present: boolean; day: number; studentId: string }[] = [];

// const now = new Date();
// for (const student of studentAttendance) {
//   for (let i = 0; i < 5; i++) {
//     const randomDay = Math.floor(Math.random() * 28) + 1;
//     const date = new Date(now.getFullYear(), now.getMonth(), randomDay);

//     attendanceData.push({
//       date,
//       present: Math.random() > 0.3,
//       day: randomDay,
//       studentId: student.id,
//     });
//   }
// }

// await prisma.attendance.createMany({ data: attendanceData, skipDuplicates: true });


  // -----------------ATTENDANCE------------------------


  // const studentAttendance = await prisma.student.findMany({ select: { id: true }});

  // for (let i = 0; i < studentAttendance.length; i++) {
  //   await prisma.attendance.create({
  //     data: {
  //       date: new Date(),
  //       present: Math.random() > 0.3,
  //       day: ((i % 5) + 1),
  //       studentId: studentAttendance[i].id,
  //     }
  //   })
  // }

  // -------------------- EVENT --------------------
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(),
        endTime: new Date(),
        classId: (i % 5) + 1,
      },
    });
  }

  // -------------------- ANNOUNCEMENT --------------------
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: (i % 5) + 1,
      },
    });
  }

  // -------------------- FEE CATEGORIES --------------------
  await prisma.feeCategory.createMany({ skipDuplicates: true,
    data: [
      { name: "Tuition" },
      { name: "Feeding" },
      { name: "Books" },
      { name: "PTA" },
      { name: "Boarding" },
    ],
  });

  // -------------------- FEE TYPES --------------------
  const tuitionType = await prisma.feeType.create({
    data: { name: "Tuition Fee", category: { connect: { id: 1 } } },
  });

  const feedingType = await prisma.feeType.create({
    data: { name: "Feeding Fee", category: { connect: { id: 2 } } },
  });

  const booksType = await prisma.feeType.create({
    data: { name: "Books Fee", category: { connect: { id: 3 } } },
  });

  const ptaType = await prisma.feeType.create({
    data: { name: "PTA Dues", category: { connect: { id: 4 } } },
  });

  const boardingFeeType = await prisma.feeType.create({
    data: { name: "Boarding Fee", category: { connect: { id: 5 } } },
  });

  // -------------------- FEE STRUCTURE (GRADE-BASED) --------------------
  for (const level of grades) {
    const gradeId = gradeRecords[level];

    await prisma.feeStructure.createMany({ skipDuplicates: true,
      data: [
        {
          typeId: tuitionType.id,
          studentType: "new",
          boardingType: "day",
          amount: 900,
          gradeId,
        },
        {
          typeId: tuitionType.id,
          studentType: "old",
          boardingType: "day",
          amount: 850,
          gradeId,
        },
      ],
    });
  }
  

  // Creating TERMS
  const terms = ["FIRST", "SECOND", "THIRD"];

await prisma.schoolTerm.createMany({
  data: [
    { name: "FIRST", startDate: new Date("2025-01-01"), endDate: new Date("2025-04-30"), isActive: true },
    { name: "SECOND", startDate: new Date("2025-05-01"), endDate: new Date("2025-08-31"), isActive: false },
    { name: "THIRD", startDate: new Date("2025-09-01"), endDate: new Date("2025-12-31"), isActive: false },
  ],
});

  // Feeding
  await prisma.feeStructure.createMany({ skipDuplicates: true,
    data: [
      { typeId: feedingType.id, studentType: "new", boardingType: "day", amount: 300 },
      { typeId: feedingType.id, studentType: "old", boardingType: "day", amount: 250 },
      { typeId: feedingType.id, studentType: "new", boardingType: "boarder", amount: 600 },
      { typeId: feedingType.id, studentType: "old", boardingType: "boarder", amount: 550 },
    ],
  });

  // Books
  await prisma.feeStructure.createMany({ skipDuplicates: true,
    data: [
      { typeId: booksType.id, studentType: "new", boardingType: "day", amount: 300 },
      { typeId: booksType.id, studentType: "old", boardingType: "day", amount: 200 },
    ],
  });

  // PTA
  await prisma.feeStructure.createMany({ skipDuplicates: true,
    data: [
      { typeId: ptaType.id, studentType: "new", boardingType: "day", amount: 50 },
      { typeId: ptaType.id, studentType: "old", boardingType: "day", amount: 50 },
    ],
  });

  // Boarding Fee
  await prisma.feeStructure.createMany({ skipDuplicates: true,
    data: [
      { typeId: boardingFeeType.id, studentType: "new", boardingType: "boarder", amount: 1800 },
      { typeId: boardingFeeType.id, studentType: "old", boardingType: "boarder", amount: 1500 },
    ],
  });

  // -------------------- INVOICE / PAYMENTS --------------------
  const students = await prisma.student.findMany();

  for (const student of students) {
    const applicable = await prisma.feeStructure.findMany({
      where: {
        studentType: student.studentType,
        boardingType: student.boardingType,
        OR: [{ gradeId: student.gradeId }, { gradeId: null }],
      },
    });

    const total = applicable.reduce((sum, f) => sum + f.amount, 0);

    const invoice = await prisma.feeMaster.create({
      data: {
        studentId: student.id,
        academicYear: "2024/2025",
        term: "FIRST",
        status: "PENDING",
        totalAmount: total,
      },
    });

    for (const f of applicable) {
      await prisma.fee.create({
        data: { masterId: invoice.id, structureId: f.id, amount: f.amount },
      });
    }

    await prisma.feePayment.create({
      data: {
        masterId: invoice.id,
        amount: Math.floor(total * 0.4),
        date: new Date(),
        method: "CASH",
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
