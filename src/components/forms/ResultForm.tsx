"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import InputField from "../InputField";
import { createResult, updateResult } from "@/lib/actions";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";

const ResultForm = ({ type, data, setOpen, relatedData }: any) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const selectedType = watch("type"); // For conditional fields
  // const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<number>(
    data?.classId || 0
  );
  const [students, setStudents] = useState<any[]>([]);

  const { classes, exams, assignments } = relatedData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch students when class changes
  useEffect(() => {
    if (selectedClass) {
      fetch(`/api/students/${selectedClass}`)
        .then((res) => res.json())
        .then((data) => setStudents(data))
        .catch(() => setStudents([]));
      setValue("studentId", "");
    } else {
      setStudents([]);
      setValue("studentId", "");
    }
    setValue("classId", selectedClass); // Save classId in form
  }, [selectedClass, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    const preparedData: ResultSchema = {
      ...formData,
      score: Number(formData.score),
      classId: Number(formData.classId),
      examId: formData.type === "EXAM" ? Number(formData.examId) || null : null,
      assignmentId: formData.type === "ASSIGNMENT" ? Number(formData.assignmentId) || null : null,
    };

    setLoading(true);
    setError(null);

    try {
      if (type === "create") {
        await createResult(null, preparedData);
        toast.success("Result created successfully!");
      } else {
        await updateResult(null, preparedData);
        toast.success("Result updated successfully!");
      }

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error creating/updating result:", err);
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  });

  const isSubmitDisabled = () => {
    if (!selectedClass || !watch("studentId") || !selectedType) return true;
    if (selectedType === "EXAM" && !watch("examId")) return true;
    if (selectedType === "ASSIGNMENT" && !watch("assignmentId")) return true;
    if (!watch("score") || Number(watch("score")) < 0) return true;
    if (loading) return true;
    return false;
  };


  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update result"}
      </h1>

      <div className="bg-white p-4 rounded-md">
        <div className="flex flex-wrap gap-4 justify-between">
          {/* Class */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            >
              <option value={0}>Select class</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Student</label>
            <Controller
              name="studentId"
              control={control}
              defaultValue={data?.studentId || ""}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={!selectedClass}
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.surname}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.studentId && <p className="text-xs text-red-400">{errors.studentId.message}</p>}
          </div>

          {/* Result Type */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Result Type</label>
            <select
              {...register("type")}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            >
              <option value="">Select type</option>
              <option value="EXAM">Exam</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>
            {errors.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
          </div>

          {/* Conditional Exam */}
          {selectedType === "EXAM" && (
            <div className="flex flex-col gap-2 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Exam</label>
              <select {...register("examId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm">
                <option value="">Select exam</option>
                {exams.map((exam: any) => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Assignment */}
          {selectedType === "ASSIGNMENT" && (
            <div className="flex flex-col gap-2 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Assignment</label>
              <select {...register("assignmentId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm">
                <option value="">Select assignment</option>
                {assignments.map((assignment: any) => (
                  <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Score */}
          <InputField
            label="Score"
            name="score"
            type="number"
            register={register}
            defaultValue={data?.score}
            error={errors.score}
          />
        </div>

        {error && <span className="text-red-500 text-sm">{error}</span>}

        <button
          type="submit"
          className={`bg-blue-500 text-white p-2 rounded-md w-full mt-4 ${isSubmitDisabled() ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isSubmitDisabled()}
        >
          {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default ResultForm;
