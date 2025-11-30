import prisma from "@/lib/prisma";
import { User, UserRoundCheck, Users, UserStar } from "lucide-react";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count();

  return (
    <div className="rounded-sm shadow odd:bg-[#CFCEFF] even:bg-[#FAE27C] p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2025/26
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl flex gap-4 items-center font-semibold my-3">
        {
          type === "admin" ? <UserStar color="green" size={20}/> : 
          type === "teacher" ? <UserRoundCheck color="green" size={20}/> : 
          type === "parent" ? <User color="green" size={20}/> : 
          <Users color="green" size={20}/> 
          } 
          {data}
      </h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
