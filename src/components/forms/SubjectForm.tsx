"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const { teachers } = relatedData || {};

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      // Convert multi-select teachers into array of strings
      const selectedTeachers = Array.isArray(formValues.teachers)
        ? formValues.teachers
        : formValues.teachers
        ? [formValues.teachers]
        : [];

      const payload = {
        ...formValues,
        id:
          formValues.id !== undefined && formValues.id !== ""
            ? typeof formValues.id === "string"
              ? parseInt(formValues.id)
              : formValues.id
            : undefined,
        teachers: selectedTeachers,
      };

      const action = type === "create" ? createSubject : updateSubject;

      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(
          `Subject has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("SUBJECT FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Subject" : "Update Subject"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between gap-4">
          {/* Subject name */}
          <InputField
            label="Subject name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors.name}
          />

          {/* Hidden ID field for updates */}
          {data?.id && (
            <InputField
              label="Id"
              name="id"
              defaultValue={data.id}
              register={register}
              error={errors.id}
              hidden
            />
          )}

          {/* Teacher multi-select */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Teachers</label>

            <select
              multiple
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("teachers")}
              defaultValue={data?.teachers?.map((t: any) => t.id) ?? []}
            >
              {teachers?.map(
                (teacher: { id: string; name: string; surname: string }) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name + " " + teacher.surname}
                  </option>
                )
              )}
            </select>

            {errors.teachers?.message && (
              <p className="text-xs text-red-400">
                {errors.teachers.message.toString()}
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

export default SubjectForm;
