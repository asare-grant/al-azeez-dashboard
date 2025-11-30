"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FeeStructureSchema, feeStructureSchema } from "@/lib/formValidationSchemas";
import { createFeeStructure, updateFeeStructure } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const FeeStructureForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classes?: any[];
    grades?: any[];
    feeTypes?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeeStructureSchema>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const { classes = [], grades = [], feeTypes = [] } = relatedData || {};

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      // Coerce IDs to numbers where needed
      const payload = {
        ...formValues,
        id:
          formValues.id !== undefined && formValues.id !== ""
            ? typeof formValues.id === "string"
              ? parseInt(formValues.id)
              : formValues.id
            : undefined,
        classId:
          formValues.classId && formValues.classId !== ""
            ? parseInt(formValues.classId as any)
            : null,
        gradeId:
          formValues.gradeId && formValues.gradeId !== ""
            ? parseInt(formValues.gradeId as any)
            : null,
        typeId: parseInt(formValues.typeId as any),
      };

      const action = type === "create" ? createFeeStructure : updateFeeStructure;

      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(
          `Fee Structure has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("FEE STRUCTURE FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Fee Structure" : "Update Fee Structure"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-between">
          {/* Amount */}
          <InputField
            label="Amount"
            name="amount"
            // type="number"
            defaultValue={data?.amount}
            register={register}
            error={errors.amount}
          />

          {/* Student Type */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Student Type</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("studentType")}
              defaultValue={data?.studentType ?? "new"}
            >
              <option value="new">New Student</option>
              <option value="old">Old Student</option>
            </select>
          </div>

          {/* Boarding Type */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Boarding Type</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("boardingType")}
              defaultValue={data?.boardingType ?? "day"}
            >
              <option value="day">Day</option>
              <option value="boarder">Boarder</option>
            </select>
          </div>

          {/* Fee Type */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Fee Type</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("typeId")}
              defaultValue={data?.typeId ?? ""}
            >
              <option value="">Select Fee Type</option>
              {feeTypes?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category?.name})
                </option>
              ))}
            </select>
            {errors.typeId && (
              <p className="text-xs text-red-400">{errors.typeId.message?.toString()}</p>
            )}
          </div>

          {/* Class */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class (Optional)</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("classId")}
              defaultValue={data?.classId ?? ""}
            >
              <option value="">None</option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Grade (Optional)</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("gradeId")}
              defaultValue={data?.gradeId ?? ""}
            >
              <option value="">None</option>
              {grades?.map((g: { id: number; level: number }) => (
                <option key={g.id} value={g.id}>
                  {g.level}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden ID for edit */}
          {data?.id && <input type="hidden" value={data.id} {...register("id")} />}
        </div>

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default FeeStructureForm;
