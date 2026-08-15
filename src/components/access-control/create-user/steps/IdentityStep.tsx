"use client";

import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Trash2,
  UserRound,
} from "lucide-react";

import Image from "next/image";

import { useState } from "react";

import { CldUploadWidget } from "next-cloudinary";

import type { CreateUserWizardData } from "../types";

import type { WizardValidationErrors } from "../validation";

/* -------------------------------------------------------------------------- */
/*                                 TYPES                                      */
/* -------------------------------------------------------------------------- */

type CloudinaryUploadResult = {
  secure_url?: string;

  public_id?: string;

  width?: number;

  height?: number;

  format?: string;
};

/* -------------------------------------------------------------------------- */
/*                              IDENTITY STEP                                 */
/* -------------------------------------------------------------------------- */

export default function IdentityStep({
  data,
  patch,
  errors,
}: {
  data: CreateUserWizardData;

  patch: (values: Partial<CreateUserWizardData>) => void;

  errors: WizardValidationErrors;
}) {
  const [uploadedImage, setUploadedImage] =
    useState<CloudinaryUploadResult | null>(
      data.imageUrl
        ? {
            secure_url: data.imageUrl,
          }
        : null,
    );

  function handleImageUploaded(info: CloudinaryUploadResult) {
    if (!info.secure_url) {
      return;
    }

    setUploadedImage(info);

    patch({
      imageUrl: info.secure_url,
    });
  }

  function removeImage() {
    /*
     * Important:
     *
     * This removes the image from the wizard
     * state only.
     *
     * It does NOT delete the Cloudinary asset.
     * Server-side asset deletion can be added
     * later if we want strict upload cleanup.
     */
    setUploadedImage(null);

    patch({
      imageUrl: "",
    });
  }

  const displayName = `${data.firstName} ${data.lastName}`.trim();

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <>
      {/* ================================================================ */}
      {/* HEADER                                                          */}
      {/* ================================================================ */}

      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Step 2
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Personal identity
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Enter the user's core identity and upload a professional profile photo
        for use throughout the school management platform.
      </p>

      {/* ================================================================ */}
      {/* PHOTO + FIELDS                                                   */}
      {/* ================================================================ */}

      <div className="mt-7 grid gap-7 xl:grid-cols-[260px_minmax(0,1fr)]">
        {/* -------------------------------------------------------------- */}
        {/* PROFILE PHOTO                                                  */}
        {/* -------------------------------------------------------------- */}

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Profile Photo
          </p>

          <div className="mt-4 flex flex-col items-center">
            {/* AVATAR */}

            <div className="relative h-36 w-36 overflow-hidden rounded-[28px] border-4 border-white bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
              {uploadedImage?.secure_url ? (
                <Image
                  src={uploadedImage.secure_url}
                  alt={displayName || "User profile"}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  {initials ? (
                    <span className="text-3xl font-black text-slate-500">
                      {initials}
                    </span>
                  ) : (
                    <UserRound className="h-12 w-12 text-slate-300" />
                  )}
                </div>
              )}

              {uploadedImage?.secure_url ? (
                <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white bg-emerald-500 text-white shadow-md">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : null}
            </div>

            {/* NAME PREVIEW */}

            <p className="mt-4 max-w-full truncate text-sm font-black text-slate-800">
              {displayName || "New school user"}
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              {data.primaryRole ?? "Account"}
            </p>

            {/* UPLOAD BUTTON */}

            <CldUploadWidget
              uploadPreset="school"
              options={{
                multiple: false,

                maxFiles: 1,

                resourceType: "image",

                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],

                cropping: true,

                croppingAspectRatio: 1,

                showSkipCropButton: false,

                folder: "school/users",
              }}
              onSuccess={(result, { widget }) => {
                if (typeof result.info === "object" && result.info) {
                  handleImageUploaded(result.info as CloudinaryUploadResult);
                }

                widget.close();
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-slate-950 px-4 text-xs font-black text-white shadow-sm transition hover:bg-blue-700"
                >
                  {uploadedImage?.secure_url ? (
                    <>
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                </button>
              )}
            </CldUploadWidget>

            {uploadedImage?.secure_url ? (
              <button
                type="button"
                onClick={removeImage}
                className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[12px] border border-red-200 bg-red-50 px-3 text-[10px] font-black uppercase tracking-[0.08em] text-red-600 transition hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Photo
              </button>
            ) : null}

            <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">
              JPG, PNG or WebP. A square portrait gives the best result across
              dashboards, profiles and reports.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* IDENTITY FIELDS                                                 */}
        {/* -------------------------------------------------------------- */}

        <section className="min-w-0">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="First name"
              value={data.firstName}
              error={errors.firstName}
              autoComplete="given-name"
              onChange={(value) =>
                patch({
                  firstName: value,
                })
              }
              placeholder="Enter first name"
            />

            <Field
              label="Last name"
              value={data.lastName}
              error={errors.lastName}
              autoComplete="family-name"
              onChange={(value) =>
                patch({
                  lastName: value,
                })
              }
              placeholder="Enter last name"
            />

            <Field
              label="Email address"
              type="email"
              value={data.email}
              error={errors.email}
              autoComplete="email"
              onChange={(value) =>
                patch({
                  email: value,
                })
              }
              placeholder="name@example.com"
            />

            <Field
              label="Phone number"
              type="tel"
              value={data.phone}
              error={errors.phone}
              autoComplete="tel"
              onChange={(value) =>
                patch({
                  phone: value,
                })
              }
              placeholder="+233..."
            />

            <Field
              label="Username"
              value={data.username}
              error={errors.username}
              autoComplete="username"
              onChange={(value) =>
                patch({
                  username: value,
                })
              }
              placeholder="school username"
            />
          </div>

          {/* PHOTO STATUS */}

          <div className="mt-5 rounded-[18px] border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

              <div>
                <p className="text-xs font-black text-blue-900">
                  Central profile image
                </p>

                <p className="mt-1 text-[11px] leading-5 text-blue-700">
                  The uploaded Cloudinary image becomes the user's central
                  school profile photo and can be reused across UserAccount,
                  navigation, profiles, student or staff records, reports and
                  other supported areas of the platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FIELD                                         */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  autoComplete,
}: {
  label: string;

  value: string;

  onChange: (value: string) => void;

  type?: string;

  placeholder?: string;

  error?: string;

  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={`mt-2 h-11 w-full rounded-[14px] border bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 ${
          error
            ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
        }`}
      />

      {error ? (
        <p
          id={`${label}-error`}
          className="mt-1.5 text-[11px] font-bold text-red-500"
        >
          {error}
        </p>
      ) : null}
    </label>
  );
}
