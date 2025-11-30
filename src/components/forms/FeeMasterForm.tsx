"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FeeMasterSchema, feeMasterSchema } from "@/lib/formValidationSchemas";
import { createFeeMaster, updateFeeMaster } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const FeeMasterForm = ({
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
  } = useForm<FeeMasterSchema>({
    resolver: zodResolver(feeMasterSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const { students } = relatedData || {};

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const payload = {
        ...formValues,
        id: formValues.id ? Number(formValues.id) : undefined,
        studentId: formValues.studentId,
        totalAmount: Number(formValues.totalAmount),
      };

      const action = type === "create" ? createFeeMaster : updateFeeMaster;
      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(`Invoice ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("FEE MASTER FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Invoice" : "Update Invoice"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        {/* Student Selector */}
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-xs text-gray-500">Student</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("studentId")}
              defaultValue={data?.studentId ?? ""}
            >
              <option value="">Select Student</option>
              {students?.map(
                (s: { id: string; name: string; surname: string }) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.surname}
                  </option>
                )
              )}
            </select>
            {errors.studentId && (
              <p className="text-xs text-red-400">
                {errors.studentId.message?.toString()}
              </p>
            )}
          </div>

          {/* Term */}
          <InputField
            label="Term"
            name="term"
            defaultValue={data?.term}
            register={register}
            error={errors.term}
          />

          {/* Academic Year */}
          <InputField
            label="Academic Year"
            name="academicYear"
            defaultValue={data?.academicYear}
            register={register}
            error={errors.academicYear}
          />

          {/* Total Amount */}
          <InputField
            label="Total Amount"
            name="totalAmount"
            type="number"
            defaultValue={data?.totalAmount}
            register={register}
            error={errors.totalAmount}
          />
        </div>
        {data?.id && (
          <input type="hidden" value={data.id} {...register("id")} />
        )}

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default FeeMasterForm;
