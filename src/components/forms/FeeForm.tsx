"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FeeSchema, feeSchema } from "@/lib/formValidationSchemas";
import { createFee, updateFee } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const FeeForm = ({
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
  } = useForm<FeeSchema>({
    resolver: zodResolver(feeSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const { structures, feeMasters } = relatedData || {};

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const payload = {
        ...formValues,
        id: formValues.id ? Number(formValues.id) : undefined,
        masterId: Number(formValues.masterId),
        structureId: Number(formValues.structureId),
        amount: Number(formValues.amount),
      };

      const action = type === "create" ? createFee : updateFee;
      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(`Fee ${type === "create" ? "added" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("FEE FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add Fee Item" : "Update Fee Item"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        {/* Invoice Selector */}
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-xs text-gray-500">Invoice</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("masterId")}
              defaultValue={data?.masterId ?? ""}
            >
              <option value="">Select Invoice</option>
              {feeMasters?.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.student.name} - {inv.term} {inv.academicYear}
                </option>
              ))}
            </select>
            {errors.masterId && (
              <p className="text-xs text-red-400">
                {errors.masterId.message?.toString()}
              </p>
            )}
          </div>

          {/* Fee Structure Selector */}
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-xs text-gray-500">Fee Structure</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("structureId")}
              defaultValue={data?.structureId ?? ""}
            >
              <option value="">Select Fee Structure</option>
              {structures?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.type.name} - {s.amount}
                </option>
              ))}
            </select>
            {errors.structureId && (
              <p className="text-xs text-red-400">
                {errors.structureId.message?.toString()}
              </p>
            )}
          </div>
          {/* Amount */}
          <InputField
            label="Amount"
            name="amount"
            type="number"
            defaultValue={data?.amount}
            register={register}
            error={errors.amount}
            />
          </div>

        {data?.id && (
          <input type="hidden" value={data.id} {...register("id")} />
        )}

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Add" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default FeeForm;
