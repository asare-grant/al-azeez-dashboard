"use client";

import * as React from "react";
import { Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Card } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Student = {
  id: number;
  name: string;
  surname: string;
  class?: { name: string };
};

interface AsyncStudentSelectorProps {
  name: string;
  label?: string;
  placeholder?: string;
  control: Control<any>;
  error?: any;
  defaultStudents?: Student[];
}

export default function AsyncStudentSelector({
  name,
  label = "Select Students",
  placeholder = "Search by name...",
  control,
  error,
  defaultStudents = [],
}: AsyncStudentSelectorProps) {
  const [query, setQuery] = React.useState("");
  const [students, setStudents] = React.useState<Student[]>(defaultStudents);
  const [loading, setLoading] = React.useState(false);

  // ✅ Debounced fetch logic
  React.useEffect(() => {
    const fetchStudents = async () => {
      if (query.length < 2) {
        setStudents(defaultStudents);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/students?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchStudents, 400);
    return () => clearTimeout(timeout);
  }, [query, defaultStudents]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // ✅ Always use string IDs to match Zod schemas
        const selectedIds: string[] = Array.isArray(field.value)
          ? field.value.map((v) => String(v))
          : [];

        const toggleStudent = (id: number) => {
          const idStr = String(id);
          const newSelection = selectedIds.includes(idStr)
            ? selectedIds.filter((s) => s !== idStr)
            : [...selectedIds, idStr];
          field.onChange(newSelection);
        };

        const removeStudent = (id: number) => {
          const idStr = String(id);
          field.onChange(selectedIds.filter((s) => s !== idStr));
        };

        const selectedStudents = students.filter((s) =>
          selectedIds.includes(String(s.id))
        );

        return (
          <div className="flex flex-col gap-2 w-full md:w-1/2 mt-4">
            {label && <Label className="text-xs text-gray-500">{label}</Label>}

            <Input
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <Card className="mt-2 max-h-56 overflow-y-auto border border-gray-200 shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ul className="text-sm">
                  {query.length < 2 ? (
                    <li className="p-2 text-gray-400 text-xs">
                      Type at least 2 letters to search...
                    </li>
                  ) : students.length === 0 ? (
                    <li className="p-2 text-gray-400 text-xs">
                      No students found.
                    </li>
                  ) : (
                    students.map((student) => (
                      <li
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={cn(
                          "p-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center",
                          selectedIds.includes(String(student.id)) &&
                            "bg-blue-50"
                        )}
                      >
                        <span>
                          {student.name} {student.surname}
                          {student.class && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({student.class.name})
                            </span>
                          )}
                        </span>
                        {selectedIds.includes(String(student.id)) && (
                          <span className="text-blue-500 text-xs">✓</span>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </Card>

            {/* ✅ Selected Chips */}
            {selectedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedStudents.map((s) => (
                  <span
                    key={s.id}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {s.name} {s.surname}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeStudent(s.id)}
                    />
                  </span>
                ))}
              </div>
            )}

            {/* ✅ Error message */}
            {error && (
              <p className="text-xs text-red-400">
                {Array.isArray(error)
                  ? error
                      .filter(Boolean)
                      .map((e) => e?.message)
                      .join(", ")
                  : error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
