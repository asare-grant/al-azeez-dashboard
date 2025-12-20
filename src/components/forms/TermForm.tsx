"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import InputField from "../InputField";
import { termSchema, TermSchema } from "@/lib/formValidationSchemas";
import { saveTermSettings } from "@/lib/actions";

const TermForm = ({ data }: { data?: any }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TermSchema>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      name: data?.name ?? "FIRST",
      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().slice(0, 10)
        : "",
      endDate: data?.endDate
        ? new Date(data.endDate).toISOString().slice(0, 10)
        : "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await saveTermSettings(values);

    if (result.success) {
      toast.success("Term settings updated");
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-4 rounded-md space-y-4 max-w-md "
    >
      {/* TERM NAME */}
      <div>
        <label className="text-xs text-gray-500">Term</label>
        <select
          {...register("name")}
          className="ring-1 ring-gray-300 p-2 rounded-md w-full"
        >
          <option value="FIRST">First Term</option>
          <option value="SECOND">Second Term</option>
          <option value="THIRD">Third Term</option>
        </select>
      </div>

      {/* START DATE */}
      <div className="flex flex-col md:flex-row gap-4">
      <InputField
        label="Term Start Date"
        name="startDate"
        type="date"
        register={register}
        error={errors.startDate}
      />

      {/* END DATE */}
      <InputField
        label="Term End Date"
        name="endDate"
        type="date"
        register={register}
        error={errors.endDate}
      />
      </div>
      {data?.id && <input type="hidden" {...register("id")} value={data.id} />}

      <button className="bg-blue-500 text-white p-2 rounded-md w-full">
        Save Settings
      </button>
    </form>
  );
};

export default TermForm;
