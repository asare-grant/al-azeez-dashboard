"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  feeCategorySchema,
  FeeCategorySchema,
} from "@/lib/formValidationSchemas";
import { createFeeCategory, updateFeeCategory } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const FeeCategoryForm = ({
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
  } = useForm<FeeCategorySchema>({
    resolver: zodResolver(feeCategorySchema),
    defaultValues: data || {},
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const payload = {
        ...formValues,
        id:
          formValues.id !== undefined
            ? typeof formValues.id === "string"
              ? parseInt(formValues.id)
              : formValues.id
            : undefined,
      };

      const action = type === "create" ? createFeeCategory : updateFeeCategory;

      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(
          `Fee Category has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("FEE CATEGORY FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Fee Category" : "Update Fee Category"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-between">
          <InputField
            label="Category Name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors.name}
          />
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
          {type === "create" ? "Create Fee Category" : "Update Fee Category"}
        </button>
      </div>
    </form>
  );
};

export default FeeCategoryForm;
