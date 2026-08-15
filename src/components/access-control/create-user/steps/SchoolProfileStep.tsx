"use client";

import type { CreateUserWizardData } from "../types";
import { WizardValidationErrors } from "../validation";

type ClassOption = {
  id: number;

  name: string;

  gradeId: number;
};

type SubjectOption = {
  id: number;

  name: string;
};

type ParentOption = {
  id: string;

  name: string;

  surname: string;

  phone: string;
};

type StudentOption = {
  id: string;

  name: string;

  surname: string;

  studentID: string;

  parentId: string | null;

  class: {
    name: string;
  };
};

export default function SchoolProfileStep({
  data,
  patch,
  classes,
  subjects,
  parents,
  students,
  errors,
  clearError,
}: {
  data: CreateUserWizardData;

  patch: (values: Partial<CreateUserWizardData>) => void;

  classes: ClassOption[];

  subjects: SubjectOption[];

  parents: ParentOption[];

  students: StudentOption[];
  errors: WizardValidationErrors;

  clearError: (key: string) => void;
}) {
  function patchProfile(values: Record<string, unknown>) {
    patch({
      profile: {
        ...data.profile,

        ...values,
      },
    });
  }

  return (
    <>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Step 3
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        School profile
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Complete the school-specific information required for this account.
      </p>

      <div className="mt-6">
        {data.primaryRole === "teacher" ? (
          <TeacherProfileFields
            profile={data.profile}
            patchProfile={patchProfile}
            subjects={subjects}
            errors={errors}
            clearError={clearError}
          />
        ) : null}

        {data.primaryRole === "student" ? (
          <StudentProfileFields
            profile={data.profile}
            patchProfile={patchProfile}
            classes={classes}
            parents={parents}
            errors={errors}
            clearError={clearError}
          />
        ) : null}

        {data.primaryRole === "parent" ? (
          <ParentProfileFields
            profile={data.profile}
            patchProfile={patchProfile}
            students={students}
            errors={errors}
            clearError={clearError}
          />
        ) : null}

        {data.primaryRole === "admin" ? (
          <SimpleProfileMessage
            title="Administrator profile"
            text="The administrator's core identity is already collected. The current Admin profile does not require additional school information."
          />
        ) : null}

        {data.primaryRole === "account" ? (
          <SimpleProfileMessage
            title="Account / Finance profile"
            text="No separate Account profile exists yet. The user will be represented by UserAccount and the Accountant RBAC role."
          />
        ) : null}
      </div>
    </>
  );
}

function TeacherProfileFields({
  profile,
  patchProfile,
  subjects,
  errors,
  clearError,
}: {
  profile: Record<string, unknown>;

  patchProfile: (values: Record<string, unknown>) => void;

  subjects: SubjectOption[];

  errors: WizardValidationErrors;

  clearError: (key: string) => void;
}) {
  const selectedSubjects = Array.isArray(profile.subjectIds)
    ? (profile.subjectIds as number[])
    : [];

  function toggleSubject(id: number) {
    patchProfile({
      subjectIds: selectedSubjects.includes(id)
        ? selectedSubjects.filter((subjectId) => subjectId !== id)
        : [...selectedSubjects, id],
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <ProfileInput
          label="Teacher ID"
          value={String(profile.teacherID ?? "")}
          error={errors.teacherID}
          onChange={(value) => {
            patchProfile({
              teacherID: value,
            });

            clearError("teacherID");
          }}
        />

        <DateInput
          label="Birthday"
          value={String(profile.birthday ?? "")}
          error={errors.birthday}
          onChange={(value) => {
            patchProfile({
              birthday: value,
            });

            clearError("birthday");
          }}
        />

        <SexSelect
          value={String(profile.sex ?? "")}
          error={errors.sex}
          onChange={(value) => {
            patchProfile({
              sex: value,
            });

            clearError("sex");
          }}
        />

        <ProfileInput
          label="Residential Address"
          value={String(profile.address ?? "")}
          error={errors.address}
          onChange={(value) => {
            patchProfile({
              address: value,
            });

            clearError("address");
          }}
        />
      </div>

      <div>
        <p className="text-xs font-black text-slate-600">Subjects</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const selected = selectedSubjects.includes(subject.id);

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => toggleSubject(subject.id)}
                className={`rounded-[14px] border px-4 py-3 text-left text-sm font-bold transition ${
                  selected
                    ? "border-blue-300 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                }`}
              >
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StudentProfileFields({
  profile,
  patchProfile,
  classes,
  parents,
  errors,
  clearError,
}: {
  profile: Record<string, unknown>;

  patchProfile: (values: Record<string, unknown>) => void;

  classes: ClassOption[];

  parents: ParentOption[];

  errors: WizardValidationErrors;

  clearError: (key: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ProfileInput
        label="Student ID"
        value={String(profile.studentID ?? "")}
        error={errors.studentID}
        onChange={(value) => {
          patchProfile({
            studentID: value,
          });

          clearError("studentID");
        }}
      />

      <DateInput
        label="Birthday"
        value={String(profile.birthday ?? "")}
        error={errors.birthday}
        onChange={(value) => {
          patchProfile({
            birthday: value,
          });

          clearError("birthday");
        }}
      />

      <SexSelect
        value={String(profile.sex ?? "")}
        error={errors.sex}
        onChange={(value) => {
          patchProfile({
            sex: value,
          });

          clearError("sex");
        }}
      />

      <ProfileInput
        label="Residential Address"
        value={String(profile.address ?? "")}
        error={errors.address}
        onChange={(value) => {
          patchProfile({
            address: value,
          });

          clearError("address");
        }}
      />

      <SelectField
        label="Class"
        value={String(profile.classId ?? "")}
        error={errors.classId}
        onChange={(value) => {
          patchProfile({
            classId: value ? Number(value) : null,
          });

          clearError("classId");
        }}
        options={classes.map((item) => ({
          value: String(item.id),

          label: item.name,
        }))}
      />

      <SelectField
        label="Parent / Guardian"
        value={String(profile.parentId ?? "")}
        onChange={(value) =>
          patchProfile({
            parentId: value || null,
          })
        }
        optional
        options={parents.map((parent) => ({
          value: parent.id,

          label: `${parent.name} ${parent.surname}`,
        }))}
      />

      <SelectField
        label="Student Type"
        value={String(profile.studentType ?? "")}
        error={errors.studentType}
        onChange={(value) => {
          patchProfile({
            studentType: value,
          });

          clearError("studentType");
        }}
        options={[
          {
            value: "new",
            label: "New Student",
          },
          {
            value: "old",
            label: "Existing Student",
          },
        ]}
      />

      <SelectField
        label="Boarding Type"
        value={String(profile.boardingType ?? "")}
        error={errors.boardingType}
        onChange={(value) => {
          patchProfile({
            boardingType: value,
          });

          clearError("boardingType");
        }}
        options={[
          {
            value: "boarder",
            label: "Boarder",
          },
          {
            value: "day",
            label: "Day Student",
          },
        ]}
      />
    </div>
  );
}

function ParentProfileFields({
  profile,
  patchProfile,
  students,
  errors,
  clearError,
}: {
  profile: Record<string, unknown>;

  patchProfile: (values: Record<string, unknown>) => void;

  students: StudentOption[];

  errors: WizardValidationErrors;

  clearError: (key: string) => void;
}) {
  const selected = Array.isArray(profile.studentIds)
    ? (profile.studentIds as string[])
    : [];

  return (
    <div className="space-y-5">
      <ProfileInput
        label="Residential Address"
        value={String(profile.address ?? "")}
        error={errors.address}
        onChange={(value) => {
          patchProfile({
            address: value,
          });

          clearError("address");
        }}
      />

      <div>
        <p className="text-xs font-black text-slate-600">Link Students</p>

        <p className="mt-1 text-xs text-slate-400">
          Optional. You may link existing students to this parent account.
        </p>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {students.map((student) => {
            const checked = selected.includes(student.id);

            return (
              <button
                key={student.id}
                type="button"
                disabled={Boolean(student.parentId)}
                onClick={() =>
                  patchProfile({
                    studentIds: checked
                      ? selected.filter((id) => id !== student.id)
                      : [...selected, student.id],
                  })
                }
                className={`rounded-[16px] border p-4 text-left transition ${
                  checked
                    ? "border-blue-300 bg-blue-50"
                    : student.parentId
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                      : "border-slate-200 hover:border-blue-200"
                }`}
              >
                <p className="font-black text-slate-800">
                  {student.name} {student.surname}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {student.studentID} · {student.class.name}
                </p>

                {student.parentId ? (
                  <p className="mt-2 text-[9px] font-black uppercase text-amber-600">
                    Already linked
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;

  value: string;

  onChange: (value: string) => void;

  error?: string;
}) {
  const errorId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-error`;

  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 h-11 w-full rounded-[14px] border bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition ${
          error
            ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
        }`}
      />

      {error ? (
        <p id={errorId} className="mt-1.5 text-[11px] font-bold text-red-500">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;

  value: string;

  onChange: (value: string) => void;

  error?: string;
}) {
  const errorId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-error`;

  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 h-11 w-full rounded-[14px] border bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition ${
          error
            ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
        }`}
      />

      {error ? (
        <p id={errorId} className="mt-1.5 text-[11px] font-bold text-red-500">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function SexSelect({
  value,
  onChange,
  error,
}: {
  value: string;

  onChange: (value: string) => void;

  error?: string;
}) {
  return (
    <SelectField
      label="Sex"
      value={value}
      onChange={onChange}
      error={error}
      options={[
        {
          value: "MALE",

          label: "Male",
        },

        {
          value: "FEMALE",

          label: "Female",
        },
      ]}
    />
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  optional = false,
  error,
}: {
  label: string;

  value: string;

  onChange: (value: string) => void;

  options: {
    value: string;

    label: string;
  }[];

  optional?: boolean;

  error?: string;
}) {
  const errorId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-error`;

  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 h-11 w-full rounded-[14px] border bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition ${
          error
            ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
        }`}
      >
        <option value="">
          {optional
            ? `No ${label.toLowerCase()} selected`
            : `Select ${label.toLowerCase()}`}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id={errorId} className="mt-1.5 text-[11px] font-bold text-red-500">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function SimpleProfileMessage({
  title,
  text,
}: {
  title: string;

  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-blue-100 bg-blue-50 p-6">
      <p className="font-black text-blue-900">{title}</p>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-700">{text}</p>
    </div>
  );
}
