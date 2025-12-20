"use client";

import React from "react";

const GradeSelect = ({ classes, value, onSelect }: any) => {
  return (
    <select
      value={value || ""}
      onChange={(e) => onSelect(e.target.value)}
      className="p-2 border rounded-lg text-slate-500 text-[14px]"
    >
      <option value="">Select Class</option>

      {classes.map((cls: any) => (
        <option key={cls.id} value={cls.id}>
          {cls.name}
        </option>
      ))}
    </select>
  );
};

export default GradeSelect;
