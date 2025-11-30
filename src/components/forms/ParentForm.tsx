"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { ParentSchema, parentSchema } from "@/lib/formValidationSchemas";
import { createParent, updateParent } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AsyncStudentSelector from "@/components/AsyncStudentSelector";

const ParentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { students: { id: number; name: string; surname: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
    defaultValues: data || {},
  });

  const [state, formAction] = useFormState(
    type === "create" ? createParent : updateParent,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData });
  });

  useEffect(() => {
    if (state.success) {
      toast(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new parent" : "Update parent details"}
      </h1>

      <div className="bg-white p-4 rounded-md">
        {/* Authentication Info */}
        <span className="text-xs text-gray-400 font-medium">
          Authentication Information
        </span>
        <div className="flex justify-between flex-wrap gap-4 mt-2">
          <InputField
            label="Username"
            name="username"
            defaultValue={data?.username}
            register={register}
            error={errors.username}
          />
          <InputField
            label="Email"
            name="email"
            defaultValue={data?.email}
            register={register}
            error={errors.email}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            defaultValue={data?.password}
            register={register}
            error={errors.password}
          />
        </div>

        {/* Personal Info */}
        <span className="text-xs text-gray-400 font-medium mt-4 block">
          Personal Information
        </span>
        <div className="flex justify-between flex-wrap gap-4 mt-3">
          <InputField
            label="First Name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors.name}
          />
          <InputField
            label="Last Name"
            name="surname"
            defaultValue={data?.surname}
            register={register}
            error={errors.surname}
          />
          <InputField
            label="Phone"
            name="phone"
            defaultValue={data?.phone}
            register={register}
            error={errors.phone}
          />
          <InputField
            label="Address"
            name="address"
            defaultValue={data?.address}
            register={register}
            error={errors.address}
          />
          <AsyncStudentSelector
            name="studentIds"
            label="Children"
            control={control}
            error={errors.studentIds}
            defaultStudents={data?.students || []}
          />
        </div>

        {/* Children Selection */}
        {/* <div className="flex flex-col gap-2 w-full md:w-1/2 mt-4">
          <label className="text-xs text-gray-500">Children</label>
          <select {...register("studentIds")} multiple className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" defaultValue={data?.students?.map((s: any) => s.id.toString()) || []}>
            {relatedData?.students?.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.studentIds?.message && <p className="text-xs text-red-400">{errors.studentIds.message.toString()}</p>}
        </div> */}

        {/* Hidden ID for updates */}
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors.id}
            hidden
          />
        )}

        {/* Error Feedback */}
        {state.error && (
          <span className="text-red-500">Something went wrong!</span>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-400 text-white p-2 rounded-md w-full mt-4"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default ParentForm;
