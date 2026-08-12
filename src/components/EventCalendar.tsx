"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";

import Calendar from "react-calendar";

import type { TileArgs } from "react-calendar";

import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

function formatDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthKey(date: Date) {
  return formatDateKey(date).slice(0, 7);
}

export default function EventCalendar({
  eventDates = [],
  initialDate,
}: {
  eventDates?: string[];

  initialDate?: string;
}) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const initialValue = initialDate
    ? new Date(`${initialDate}T12:00:00`)
    : new Date();

  const [value, setValue] = useState<Value>(initialValue);

  const eventDateSet = new Set(eventDates);

  function updateQuery(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, nextValue] of Object.entries(updates)) {
      params.set(key, nextValue);
    }

    router.push(`?${params.toString()}`);
  }

  function handleChange(nextValue: Value) {
    setValue(nextValue);

    if (nextValue instanceof Date) {
      updateQuery({
        date: formatDateKey(nextValue),

        month: formatMonthKey(nextValue),
      });
    }
  }

  function handleActiveStartDateChange({
    activeStartDate,
  }: {
    activeStartDate: Date | null;
  }) {
    if (!activeStartDate) {
      return;
    }

    updateQuery({
      month: formatMonthKey(activeStartDate),
    });
  }

  function renderTile({ date, view }: TileArgs) {
    if (view !== "month") {
      return null;
    }

    const key = formatDateKey(date);

    if (!eventDateSet.has(key)) {
      return null;
    }

    return (
      <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
    );
  }

  return (
    <Calendar
      onChange={handleChange}
      onActiveStartDateChange={handleActiveStartDateChange}
      value={value}
      tileContent={renderTile}
    />
  );
}
