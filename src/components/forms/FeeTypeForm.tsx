"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { feeTypeSchema, FeeTypeSchema } from "@/lib/formValidationSchemas";
import { createFeeType, updateFeeType } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const FeeTypeForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { categories: { id: number; name: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeeTypeSchema>({
    resolver: zodResolver(feeTypeSchema),
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
        categoryId: Number(formValues.categoryId),
      };

      const action = type === "create" ? createFeeType : updateFeeType;

      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(
          `Fee Type has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("FEE TYPE FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  const { categories } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Fee Type" : "Update Fee Type"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-between">
          <InputField
            label="Fee Type Name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors.name}
          />
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <label className="text-xs text-gray-500">Fee Category</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("categoryId")}
              defaultValue={data?.categoryId ?? ""}
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-400">
                {errors.categoryId.message?.toString()}
              </p>
            )}
          </div>
        </div>
        {data?.id && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Create Fee Type" : "Update Fee Type"}
        </button>
      </div>
    </form>
  );
};

export default FeeTypeForm;
