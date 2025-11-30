"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FeePaymentSchema, feePaymentSchema } from "@/lib/formValidationSchemas";
import { createFeePayment, updateFeePayment } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const FeePaymentForm = ({
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
  const { register, handleSubmit, formState: { errors } } = useForm<FeePaymentSchema>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const { feeMasters } = relatedData || {};

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const payload = {
        ...formValues,
        id: formValues.id ? Number(formValues.id) : undefined,
        masterId: Number(formValues.masterId),
        amount: Number(formValues.amount),
        method: formValues.method,
        date: formValues.date ? new Date(formValues.date) : new Date(),
      };

      const action = type === "create" ? createFeePayment : updateFeePayment;
      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(`Payment ${type === "create" ? "recorded" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("FEE PAYMENT FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Record Payment" : "Update Payment"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-between">
        {/* Invoice Selector */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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
          {errors.masterId && <p className="text-xs text-red-400">{errors.masterId.message?.toString()}</p>}
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

        {/* Payment Method */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Payment Method</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("method")}
            defaultValue={data?.method ?? ""}
          >
            <option value="">Select Method</option>
            <option value="CASH">Cash</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="BANK">Bank</option>
            <option value="CHEQUE">Cheque</option>
          </select>
          {errors.method && <p className="text-xs text-red-400">{errors.method.message?.toString()}</p>}
        </div>

        {/* Date */}
        <InputField
          label="Payment Date"
          name="date"
          type="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().slice(0, 10) : ""}
          register={register}
          error={errors.date}
        />
        </div>
        {data?.id && <input type="hidden" value={data.id} {...register("id")} />}

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Record" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default FeePaymentForm;
