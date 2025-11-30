"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AssignmentSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const router = useRouter();
  const [lessons, setLessons] = useState<{ id: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: data || {},
  });

  // Fetch lessons for the current user (teacher or admin)
  useEffect(() => {
    fetch("/api/lessonsForUser")
      .then((res) => res.json())
      .then((data) => setLessons(data.lessons || []))
      .catch((err) => console.error("Error fetching lessons:", err));
  }, []);

  const onSubmit = handleSubmit((formData) => {
    startTransition(async () => {
      try {
        // Ensure proper types
        const payload: AssignmentSchema = {
          ...formData,
          startDate: new Date(formData.startDate),
          dueDate: new Date(formData.dueDate),
          lessonId: Number(formData.lessonId),
        };

        const result =
          type === "create"
            ? await createAssignment(payload)
            : await updateAssignment(payload);

        if (result.success) {
          toast.success(
            `Assignment has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error("Something went wrong while submitting the assignment!");
        }
      } catch (err) {
        console.error("❌ Error submitting assignment:", err);
        toast.error("Something went wrong while submitting the assignment!");
      }
    });
  });

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new assignment"
          : "Update the assignment"}
      </h1>

      <div className="bg-white p-4">
        <div className="flex justify-between flex-wrap gap-4">
          {/* Assignment Title */}
          <InputField
            label="Assignment Title"
            name="title"
            register={register}
            defaultValue={data?.title}
            error={errors?.title}
          />

          {/* Start Date */}
          <InputField
            label="Start Date"
            name="startDate"
            type="date"
            register={register}
            defaultValue={formatDate(data?.startDate)}
            error={errors?.startDate}
          />

          {/* Due Date */}
          <InputField
            label="Due Date"
            name="dueDate"
            type="date"
            register={register}
            defaultValue={formatDate(data?.dueDate)}
            error={errors?.dueDate}
          />

          {/* Hidden ID for edit mode */}
          {data?.id && (
            <input type="hidden" value={data.id} {...register("id")} />
          )}

          {errors.id && (
            <span className="text-red-500">Something went wrong!</span>
          )}

          {/* Lesson Select */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Lesson</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("lessonId")}
              defaultValue={data?.lessonId || ""}
            >
              <option value="">Select lesson</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))}
            </select>
            {errors.lessonId?.message && (
              <p className="text-xs text-red-400">
                {errors.lessonId.message.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-400 text-white p-2 rounded-md w-full mt-4"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
