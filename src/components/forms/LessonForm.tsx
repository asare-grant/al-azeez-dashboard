"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const LessonForm = ({
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
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  // React 19 note: useActionState will replace this
  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes, subjects, teachers } = relatedData;

  // Helper: convert DateTime → HH:mm for editing
  const formatTime = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new lesson" : "Update the lesson"}
      </h1>

      <div className="bg-white p-4">
        <div className="flex justify-between flex-wrap gap-4">
          {/* LESSON NAME */}
          <InputField
            label="Lesson Name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
          />

          {/* HIDDEN ID FIELD */}
          {data?.id && (
            <input type="hidden" defaultValue={data.id} {...register("id")} />
          )}

          {errors.id && (
            <span className="text-red-500">Something went wrong!</span>
          )}

          {/* DAY */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Day</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("day")}
              defaultValue={data?.day || "MONDAY"}
            >
              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(
                (day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                )
              )}
            </select>
            {errors.day?.message && (
              <p className="text-xs text-red-400">
                {errors.day.message.toString()}
              </p>
            )}
          </div>

          {/* START TIME */}
          <InputField
            label="Start Time"
            name="startTime"
            type="time"
            defaultValue={formatTime(data?.startTime) || "08:00"}
            register={register}
            error={errors?.startTime}
          />

          {/* END TIME */}
          <InputField
            label="End Time"
            name="endTime"
            type="time"
            defaultValue={formatTime(data?.endTime) || "09:00"}
            register={register}
            error={errors?.endTime}
          />

          {/* SUBJECT */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Subject</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("subjectId")}
              defaultValue={data?.subjectId}
            >
              <option value="">Select subject</option>
              {subjects.map((subject: { id: number; name: string }) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId?.message && (
              <p className="text-xs text-red-400">
                {errors.subjectId.message.toString()}
              </p>
            )}
          </div>

          {/* CLASS */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("classId")}
              defaultValue={data?.classId}
            >
              <option value="">Select class</option>
              {classes.map((cls: { id: number; name: string }) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {errors.classId?.message && (
              <p className="text-xs text-red-400">
                {errors.classId.message.toString()}
              </p>
            )}
          </div>

          {/* TEACHER */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Teacher</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("teacherId")}
              defaultValue={data?.teacherId}
            >
              <option value="">Select teacher</option>
              {teachers.map(
                (teacher: { id: string; name: string; surname: string }) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name + " " + teacher.surname}
                  </option>
                )
              )}
            </select>
            {errors.teacherId?.message && (
              <p className="text-xs text-red-400">
                {errors.teacherId.message.toString()}
              </p>
            )}
          </div>
        </div>

        {/* ERRORS + SUBMIT */}
        {state.error && (
          <span className="text-red-500">Something went wrong!</span>
        )}

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;
