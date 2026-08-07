"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldError, useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import type { z } from "zod";

type AssignmentFormInput = z.input<typeof assignmentSchema>;

type AssignmentTermOption = {
  id: number;
  name: string;
  isActive: boolean;
};

type AcademicPeriodOptions = {
  academicYears: string[];

  terms: AssignmentTermOption[];

  defaultAcademicYear: string;

  defaultTermId: number | null;
};

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AssignmentSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormInput, unknown, AssignmentSchema>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      id: data?.id,

      title: data?.title ?? "",

      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().slice(0, 10)
        : "",

      dueDate: data?.dueDate
        ? new Date(data.dueDate).toISOString().slice(0, 10)
        : "",

      lessonId: data?.lessonId ?? "",

      academicYear:
        data?.academicYear ?? relatedData?.defaultAcademicYear ?? "",

      termId: data?.termId ?? relatedData?.defaultTermId ?? "",
    },
  });

  const router = useRouter();
  const [lessons, setLessons] = useState<{ id: number; name: string }[]>([]);

  const [periodOptions, setPeriodOptions] = useState<AcademicPeriodOptions>({
    academicYears: relatedData?.academicYears ?? [],

    terms: relatedData?.terms ?? [],

    defaultAcademicYear: relatedData?.defaultAcademicYear ?? "",

    defaultTermId: relatedData?.defaultTermId ?? null,
  });

  const [loadingPeriodOptions, setLoadingPeriodOptions] = useState(false);

  const [periodOptionsError, setPeriodOptionsError] = useState<string | null>(
    null,
  );

  // Fetch lessons for the current user (teacher or admin)
  useEffect(() => {
    fetch("/api/lessonsForUser")
      .then((res) => res.json())
      .then((data) => setLessons(data.lessons || []))
      .catch((err) => console.error("Error fetching lessons:", err));
  }, []);

  const onSubmit = handleSubmit((formData) => {
    startTransition(async () => {
      try {
        if (!formData.academicYear?.trim()) {
          toast.error("Select an academic year.");

          return;
        }

        const termId = Number(formData.termId);

        if (!Number.isInteger(termId) || termId <= 0) {
          toast.error("Select a valid school term.");

          return;
        }

        // Ensure proper types
        const payload: AssignmentSchema = {
          ...formData,

          title: formData.title.trim(),

          academicYear: formData.academicYear.trim(),
        };

        const result =
          type === "create"
            ? await createAssignment(payload)
            : await updateAssignment(payload);

        if (result.success) {
          toast.success(
            `Assignment has been ${type === "create" ? "created" : "updated"}!`,
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error("Something went wrong while submitting the assignment!");
        }
      } catch (err) {
        console.error("❌ Error submitting assignment:", err);
        toast.error("Something went wrong while submitting the assignment!");
      }
    });
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAcademicPeriodOptions() {
      setLoadingPeriodOptions(true);

      setPeriodOptionsError(null);

      try {
        const response = await fetch("/api/academic-period-options", {
          method: "GET",
          cache: "no-store",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.message || "Academic-period options could not be loaded.",
          );
        }

        if (cancelled) {
          return;
        }

        setPeriodOptions({
          academicYears: payload.academicYears ?? [],

          terms: payload.terms ?? [],

          defaultAcademicYear: payload.defaultAcademicYear ?? "",

          defaultTermId: payload.defaultTermId ?? null,
        });

        /*
         * Apply defaults only during creation.
         * Existing assignment values must remain unchanged.
         */
        if (type === "create") {
          const currentAcademicYear = getValues("academicYear");

          const currentTermId = getValues("termId");

          if (!currentAcademicYear && payload.defaultAcademicYear) {
            setValue("academicYear", String(payload.defaultAcademicYear), {
              shouldValidate: true,
            });
          }

          if (!currentTermId && payload.defaultTermId) {
            setValue("termId", Number(payload.defaultTermId), {
              shouldValidate: true,
            });
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Academic-period options could not be loaded.";

        setPeriodOptionsError(message);

        console.error("ASSIGNMENT PERIOD OPTIONS ERROR:", error);
      } finally {
        if (!cancelled) {
          setLoadingPeriodOptions(false);
        }
      }
    }

    loadAcademicPeriodOptions();

    return () => {
      cancelled = true;
    };
  }, [type, getValues, setValue]);

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new assignment"
          : "Update the assignment"}
      </h1>

      <div className="bg-white p-4">
        <div className="flex justify-between flex-wrap gap-4">
          {/* Assignment Title */}
          <InputField
            label="Assignment Title"
            name="title"
            register={register}
            defaultValue={data?.title}
            error={errors?.title}
          />

          {/* Start Date */}
          <InputField
            label="Start Date"
            name="startDate"
            type="date"
            register={register}
            defaultValue={formatDate(data?.startDate)}
            error={errors.startDate as FieldError | undefined}
          />

          {/* Due Date */}
          <InputField
            label="Due Date"
            name="dueDate"
            type="date"
            register={register}
            defaultValue={formatDate(data?.dueDate)}
            error={errors.dueDate as FieldError | undefined}
          />

          {/* Hidden ID for edit mode */}
          {data?.id && (
            <input type="hidden" value={data.id} {...register("id")} />
          )}

          {errors.id && (
            <span className="text-red-500">Something went wrong!</span>
          )}

          {/* Lesson Select */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Lesson</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("lessonId")}
              defaultValue={data?.lessonId || ""}
            >
              <option value="">Select lesson</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))}
            </select>
            {errors.lessonId?.message && (
              <p className="text-xs text-red-400">
                {errors.lessonId.message.toString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Academic Year</label>

            <select
              {...register("academicYear")}
              disabled={loadingPeriodOptions}
              defaultValue={
                data?.academicYear ?? periodOptions.defaultAcademicYear ?? ""
              }
              className="rounded-md p-2 ring-1 ring-gray-300"
            >
              <option value="">
                {loadingPeriodOptions
                  ? "Loading academic years..."
                  : "Select academic year"}
              </option>

              {periodOptions.academicYears.map((academicYear) => (
                <option key={academicYear} value={academicYear}>
                  {academicYear}
                </option>
              ))}
            </select>

            {errors.academicYear?.message ? (
              <p className="text-xs text-red-400">
                {errors.academicYear.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">School Term</label>

            <select
              {...register("termId")}
              disabled={loadingPeriodOptions}
              defaultValue={data?.termId ?? periodOptions.defaultTermId ?? ""}
              className="rounded-md p-2 ring-1 ring-gray-300"
            >
              <option value="">
                {loadingPeriodOptions ? "Loading terms..." : "Select term"}
              </option>

              {periodOptions.terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name.replace(/_/g, " ")}
                  {term.isActive ? " — Active" : ""}
                </option>
              ))}
            </select>

            {errors.termId?.message ? (
              <p className="text-xs text-red-400">{errors.termId.message}</p>
            ) : null}
          </div>
        </div>

        {periodOptionsError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {periodOptionsError}
          </div>
        ) : null}

        {/* Submit Button */}
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

export default AssignmentForm;
