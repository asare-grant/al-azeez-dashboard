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
    0
  );

  return {
    total: feeMaster.totalAmount,
    paid,
    balance: feeMaster.totalAmount - paid,
  };
};

const ParentPage = async () => {
  const { userId } = await auth();
  const currentUserId = userId;

  const students = await prisma.student.findMany({
    where: { parentId: currentUserId! },
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
      feeMasters: {
        orderBy: { createdAt: "desc" },
        take: 1, // latest / active term
        include: {
          payments: true,
        },
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
                  total={total}
                  paid={paid}
                  balance={balance}
                  feeMaster={feeMaster}
                />

                {/* 🔹 CALENDAR */}
                <div className="mt-6">
                  <BigCalendarContainer
                    lessons={student.class.lessons}
                  />
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






// import Announcements from "@/components/Announcements";
// import BigCalendarContainer from "@/components/BigCalendarContainer";
// import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// const ParentPage = async () => {
//   const { userId } = await auth();
//   const currentUserId = userId;

//   // Fetch all children of the parent with lessons, assignments, and teacher info
//   const students = await prisma.student.findMany({
//     where: { parentId: currentUserId! },
//     include: {
//       class: {
//         include: {
//           lessons: {
//             include: {
//               teacher: true,
//               assignments: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   return (
//     <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
//       {/* LEFT: Child Calendars */}
//       <div className="w-full xl:w-2/3">
//         {students.map((student) => (
//           <div className="w-full mb-6" key={student.id}>
//             <div className="h-full bg-white p-4 rounded-md">
//               <h1 className="text-xl font-semibold mb-4">
//                 Schedule ({student.name} {student.surname})
//               </h1>
//               <BigCalendarContainer lessons={student.class.lessons} />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* RIGHT: Announcements */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-8">
//         <Announcements />
//       </div>
//     </div>
//   );
// };

// export default ParentPage;
