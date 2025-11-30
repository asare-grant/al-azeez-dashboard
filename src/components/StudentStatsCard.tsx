"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, UserCheck, UserPlus2, UserMinus, History, Sparkles, Building2, Bus, Ellipsis } from "lucide-react";

const icons = {
  old: <History color="#CFCEFF" size={20} />,
  new: <Sparkles color="#FAE27C" size={20} />,
  boarder: <Building2 color="#CFCEFF" size={20} />,
  day: <Bus color="#FAE27C" size={20} />,
};

const StudentStatsCard = ({ type }: { type: "old" | "new" | "boarder" | "day" }) => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const res = await fetch(`/api/student-stats?type=${type}`);
      const data = await res.json();
      setCount(data.count);
    };
    fetchCount();
  }, [type]);

  const titles = {
    old: "Old Students",
    new: "New Students",
    boarder: "Boarders",
    day: "Day Students",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-sm bg-white shadow p-4 flex-1 min-w-[130px] border odd:border-[#CFCEFF] even:border-[#FAE27C] overflow-hidden"
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-green-100 px-2 py-1 rounded-full text-green-700">
          2025/26
        </span>
        <Ellipsis size={20} color="green" />
      </div>

      <h1 className="text-2xl flex gap-4 items-center font-semibold my-3">

        {icons[type]}

        {count === null ? (
          <div className="h-6 w-10 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          count
        )}
      </h1>

      <h2 className="capitalize text-sm font-medium text-gray-600">
        {titles[type]}
      </h2>

    </motion.div>
  );
};

export default StudentStatsCard;
