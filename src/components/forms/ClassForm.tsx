"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
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
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: data || {},
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const payload = {
        ...formValues,
        id:
          formValues.id !== undefined && formValues.id !== ""
            ? typeof formValues.id === "string"
              ? parseInt(formValues.id)
              : formValues.id
            : undefined,
        capacity:
          typeof formValues.capacity === "string"
            ? parseInt(formValues.capacity)
            : formValues.capacity,
        gradeId:
          formValues.gradeId && formValues.gradeId !== ""
            ? parseInt(formValues.gradeId)
            : null,
      };

      const action = type === "create" ? createClass : updateClass;
      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(
          `Class has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.error("CLASS FORM ERROR:", error);
      toast.error("Something went wrong!");
    }
  });

  const { teachers, grades } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Class" : "Update Class"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-between">
          {/* Name */}
          <InputField
            label="Class Name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors.name}
          />

          {/* Capacity */}
          <InputField
            label="Capacity"
            name="capacity"
            defaultValue={data?.capacity}
            register={register}
            error={errors.capacity}
          />

          {/* Hidden ID Field (Update only) */}
          {data && (
            <InputField
              label="Id"
              name="id"
              defaultValue={data.id}
              register={register}
              hidden
            />
          )}

          {/* Supervisor Selector */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Supervisor</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("supervisorId")}
              defaultValue={data?.supervisorId ?? ""}
            >
              <option value="">Select Supervisor</option>
              {teachers?.map(
                (t: { id: string; name: string; surname: string }) => (
                  <option key={t.id} value={t.id}>
                    {t.name + " " + t.surname}
                  </option>
                )
              )}
            </select>
            {errors.supervisorId && (
              <p className="text-xs text-red-400">
                {errors.supervisorId.message?.toString()}
              </p>
            )}
          </div>

          {/* Grade Selector */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Grade</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("gradeId")}
              defaultValue={data?.gradeId ?? ""}
            >
              <option value="">Select Grade</option>
              {grades?.map((g: { id: number; level: number }) => (
                <option key={g.id} value={g.id}>
                  {g.level}
                </option>
              ))}
            </select>
            {errors.gradeId && (
              <p className="text-xs text-red-400">
                {errors.gradeId.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;
