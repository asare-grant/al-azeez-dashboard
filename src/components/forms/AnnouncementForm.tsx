"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AnnouncementSchema,
  announcementSchema,
} from "@/lib/formValidationSchemas";
import {
  createAnnouncement,
  updateAnnouncement,
} from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";

const AnnouncementForm = ({
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
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: data || {},
  });

  const router = useRouter();
  const { classes } = relatedData || {};

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const payload = {
        ...formValues,
        id:
          formValues.id !== undefined && formValues.id !== ""
            ? Number(formValues.id)
            : undefined,
        classId:
          formValues.classId && formValues.classId !== ""
            ? Number(formValues.classId)
            : null,
        date: new Date(formValues.date),
      };

      const action =
        type === "create" ? createAnnouncement : updateAnnouncement;

      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(
          `Announcement has been ${
            type === "create" ? "created" : "updated"
          } successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("ANNOUNCEMENT FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Announcement" : "Update Announcement"}
      </h1>

      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-between">
          {/* Title */}
          <InputField
            label="Title"
            name="title"
            defaultValue={data?.title}
            register={register}
            error={errors.title}
          />

          {/* Date */}
          <InputField
            label="Date"
            name="date"
            type="date"
            defaultValue={
              data?.date ? new Date(data.date).toISOString().slice(0, 10) : ""
            }
            register={register}
            error={errors.date}
          />

          {/* Class Selector */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class (optional)</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("classId")}
              defaultValue={data?.classId ?? ""}
            >
              <option value="">Select class</option>
              {classes?.map((cls: { id: number; name: string }) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="text-xs text-red-400">
                {errors.classId.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            rows={4}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            placeholder="Enter announcement details..."
            defaultValue={data?.description}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-red-400">
              {errors.description.message?.toString()}
            </p>
          )}
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

export default AnnouncementForm;
