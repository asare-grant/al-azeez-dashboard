"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EventSchema, eventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";


const EventForm = ({
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
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: data || {},
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      // Coerce IDs to number
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
            ? parseInt(formValues.classId)
            : null,
        date: new Date(formValues.date),
        startTime: new Date(formValues.startTime),
        endTime: new Date(formValues.endTime),
      };

      const action = type === "create" ? createEvent : updateEvent;

      const result = await action({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(
          `Event has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("EVENT FORM ERROR:", err);
      toast.error("Something went wrong!");
    }
  });

  const { classes } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Event" : "Update Event"}
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

          {/* Start Time */}
          <InputField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            defaultValue={
              data?.startTime
                ? new Date(data.startTime).toISOString().slice(0, 16)
                : ""
            }
            register={register}
            error={errors.startTime}
          />

          {/* End Time */}
          <InputField
            label="End Time"
            name="endTime"
            type="datetime-local"
            defaultValue={
              data?.endTime
                ? new Date(data.endTime).toISOString().slice(0, 16)
                : ""
            }
            register={register}
            error={errors.endTime}
          />
          {data && (
            <InputField
              label="Id"
              name="id"
              defaultValue={data?.id}
              register={register}
              error={errors?.id}
              hidden
            />
          )}
          {/* Class selector */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("classId")}
              defaultValue={data?.classId ?? ""}
            >
              <option value="">Select class (optional)</option>
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

        {/* Description textarea */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            rows={4}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            placeholder="Enter event details here..."
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

        {errors.id && (
          <span className="text-red-500">Something went wrong!</span>
        )}

        <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
