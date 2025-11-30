"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const { lessons } = relatedData || {};

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      // Proper coercions (same pattern as EventForm)
      const payload = {
        ...formValues,

        id:
          formValues.id !== undefined && formValues.id !== ""
            ? typeof formValues.id === "string"
              ? parseInt(formValues.id)
              : formValues.id
            : undefined,

        lessonId:
          formValues.lessonId && formValues.lessonId !== ""
            ? parseInt(formValues.lessonId)
            : null,

        startTime: new Date(formValues.startTime),
        endTime: new Date(formValues.endTime),
      };

      const action = type === "create" ? createExam : updateExam;

      const result = await action(
        { success: false, error: false }, // same signature as EventForm
        payload
      );

      if (result.success) {
        toast.success(
          `Exam has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("EXAM FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Exam" : "Update Exam"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-between">
          {/* Exam title */}
          <InputField
            label="Exam Title"
            name="title"
            defaultValue={data?.title}
            register={register}
            error={errors.title}
          />

          {/* Start Date */}
          <InputField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            defaultValue={
              data?.startTime
                ? new Date(data.startTime).toISOString().slice(0, 16)
                : ""
            }
            register={register}
            error={errors.startTime}
          />

          {/* End Date */}
          <InputField
            label="End Time"
            name="endTime"
            type="datetime-local"
            defaultValue={
              data?.endTime
                ? new Date(data.endTime).toISOString().slice(0, 16)
                : ""
            }
            register={register}
            error={errors.endTime}
          />

          {/* Hidden ID (for UPDATE only) */}
          {data?.id && (
            <input type="hidden" value={data.id} {...register("id")} />
          )}

          {errors.id && (
            <span className="text-red-500">Something went wrong!</span>
          )}

          {/* Lesson selector */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Lesson</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("lessonId")}
              defaultValue={data?.lessonId ?? ""}
            >
              <option value="">Select lesson</option>
              {lessons?.map((lesson: { id: number; name: string }) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))}
            </select>
            {errors.lessonId && (
              <p className="text-xs text-red-400">
                {errors.lessonId.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Error message */}
        {errors.id && (
          <span className="text-red-500">Something went wrong!</span>
        )}

        {/* Submit button */}
        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;
