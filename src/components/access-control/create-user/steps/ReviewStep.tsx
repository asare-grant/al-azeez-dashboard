// "use client";

// import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";

// import type { CreateUserWizardData } from "../types";

// import Image from "next/image";

// export default function ReviewStep({
//   data,
//   roles,
// }: {
//   data: CreateUserWizardData;

//   roles: {
//     id: number;

//     name: string;

//     key: string;
//   }[];
// }) {
//   const selectedRoles = roles.filter((role) => data.roleIds.includes(role.id));

//   return (
//     <>
//       <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
//         Final Review
//       </p>

//       <h2 className="mt-2 text-2xl font-black text-slate-950">
//         Review provisioning
//       </h2>

//       <p className="mt-2 text-sm text-slate-500">
//         Confirm the identity and access profile before creating the account.
//       </p>

//       <div className="mb-6 flex flex-col gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
//         <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border-2 border-white bg-white shadow-md">
//           {data.imageUrl ? (
//             <Image
//               src={data.imageUrl}
//               alt={`${data.firstName} ${data.lastName}`}
//               fill
//               sizes="64px"
//               className="object-cover"
//             />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center bg-slate-100">
//               <UserRound className="h-6 w-6 text-slate-300" />
//             </div>
//           )}
//         </div>

//         <div className="min-w-0">
//           <p className="truncate text-lg font-black text-slate-950">
//             {data.firstName || data.lastName
//               ? `${data.firstName} ${data.lastName}`.trim()
//               : "New User"}
//           </p>

//           <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
//             {data.primaryRole ?? "No account type"}
//           </p>

//           <p className="mt-1 truncate text-xs text-slate-400">
//             {data.email || "No email supplied"}
//           </p>
//         </div>
//       </div>

//       <div className="mt-6 grid gap-4 lg:grid-cols-2">
//         <ReviewCard icon={UserRound} title="Identity">
//           <p>
//             {data.firstName} {data.lastName}
//           </p>

//           <p className="text-slate-400">{data.primaryRole}</p>
//         </ReviewCard>

//         <ReviewCard icon={Mail} title="Contact">
//           <p>{data.email}</p>

//           <p className="text-slate-400">{data.phone || "No phone number"}</p>
//         </ReviewCard>

//         <ReviewCard icon={KeyRound} title="RBAC Roles">
//           <div className="flex flex-wrap gap-1.5">
//             {selectedRoles.map((role) => (
//               <span
//                 key={role.id}
//                 className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase text-blue-700"
//               >
//                 {role.name}
//               </span>
//             ))}
//           </div>
//         </ReviewCard>

//         <ReviewCard icon={ShieldCheck} title="Provisioning">
//           <p>Clerk authentication</p>

//           <p className="text-slate-400">Prisma identity + access audit</p>
//         </ReviewCard>
//       </div>
//     </>
//   );
// }

// function ReviewCard({
//   icon: Icon,
//   title,
//   children,
// }: {
//   icon: typeof UserRound;

//   title: string;

//   children: React.ReactNode;
// }) {
//   return (
//     <article className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
//       <div className="flex items-center gap-2">
//         <Icon className="h-4 w-4 text-blue-600" />

//         <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
//           {title}
//         </p>
//       </div>

//       <div className="mt-4 space-y-1 text-sm font-bold text-slate-800">
//         {children}
//       </div>
//     </article>
//   );
// }





"use client";

import Image from "next/image";

import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  School,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  CreateUserWizardData,
} from "../types";

import type {
  WizardValidationResult,
} from "../validation";

type RoleOption = {
  id: number;

  name: string;

  key: string;
};

export default function ReviewStep({
  data,
  roles,
  validation,
}: {
  data:
    CreateUserWizardData;

  roles:
    RoleOption[];

  validation:
    WizardValidationResult;
}) {
  const selectedRoles =
    roles.filter(
      (
        role,
      ) =>
        data.roleIds.includes(
          role.id,
        ),
    );

  const displayName =
    `${data.firstName} ${data.lastName}`.trim() ||
    "New User";

  const accountLabel =
    getAccountLabel(
      data.primaryRole,
    );

  const profile =
    data.profile;

  return (
    <>
      {/* ================================================================ */}
      {/* HEADER                                                          */}
      {/* ================================================================ */}

      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Final Review
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Review provisioning
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Confirm the user's identity, school profile, security settings and
        role-based access before the account is created.
      </p>

      {/* ================================================================ */}
      {/* READINESS STATUS                                                */}
      {/* ================================================================ */}

      <div
        className={`mt-6 flex items-start gap-3 rounded-[18px] border p-4 ${
          validation.valid
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            validation.valid
              ? "bg-emerald-600 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {validation.valid ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>

        <div>
          <p
            className={`text-sm font-black ${
              validation.valid
                ? "text-emerald-950"
                : "text-amber-950"
            }`}
          >
            {validation.valid
              ? "Ready for provisioning"
              : "Additional information required"}
          </p>

          <p
            className={`mt-1 text-xs leading-5 ${
              validation.valid
                ? "text-emerald-700"
                : "text-amber-700"
            }`}
          >
            {validation.valid
              ? "All required information has passed the current wizard validation. The final server-side checks will run when Create User is selected."
              : "One or more required fields are incomplete. Creating the user will return you to the earliest step that needs attention."}
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* USER SUMMARY                                                    */}
      {/* ================================================================ */}

      <div className="mt-6 flex flex-col gap-5 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border-4 border-white bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          {data.imageUrl ? (
            <Image
              src={
                data.imageUrl
              }
              alt={
                displayName
              }
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <UserRound className="h-8 w-8 text-slate-300" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-xl font-black text-slate-950">
              {
                displayName
              }
            </h3>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-blue-700">
              {
                accountLabel
              }
            </span>
          </div>

          <p className="mt-2 truncate text-sm font-semibold text-slate-500">
            @
            {data.username ||
              "username"}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />

              {data.email ||
                "No email supplied"}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />

              {data.phone ||
                "No phone number"}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* REVIEW GRID                                                     */}
      {/* ================================================================ */}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* IDENTITY */}

        <ReviewCard
          icon={
            UserRound
          }
          title="Identity"
        >
          <ReviewRow
            label="Full Name"
            value={
              displayName
            }
          />

          <ReviewRow
            label="Username"
            value={
              data.username ||
              "Not supplied"
            }
          />

          <ReviewRow
            label="Account Type"
            value={
              accountLabel
            }
          />
        </ReviewCard>

        {/* CONTACT */}

        <ReviewCard
          icon={
            Mail
          }
          title="Contact"
        >
          <ReviewRow
            label="Email"
            value={
              data.email ||
              "Not supplied"
            }
          />

          <ReviewRow
            label="Phone"
            value={
              data.phone ||
              "Not supplied"
            }
          />
        </ReviewCard>

        {/* SCHOOL PROFILE */}

        <SchoolProfileReview
          data={
            data
          }
        />

        {/* ACCESS */}

        <ReviewCard
          icon={
            KeyRound
          }
          title="RBAC Roles"
        >
          {selectedRoles.length >
          0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map(
                (
                  role,
                ) => (
                  <span
                    key={
                      role.id
                    }
                    className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.06em] text-blue-700"
                  >
                    {
                      role.name
                    }
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-400">
              No access roles selected.
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-slate-400">
            {selectedRoles.length} role
            {selectedRoles.length ===
            1
              ? ""
              : "s"}{" "}
            will be assigned to this user.
          </p>
        </ReviewCard>

        {/* SECURITY */}

        <ReviewCard
          icon={
            ShieldCheck
          }
          title="Account Security"
        >
          <ReviewRow
            label="Authentication"
            value="Managed by Clerk"
          />

          <ReviewRow
            label="Initial Password"
            value={
              data.password
                ? "Configured"
                : "Missing"
            }
          />

          <ReviewRow
            label="Password Match"
            value={
              data.password &&
              data.confirmPassword &&
              data.password ===
                data.confirmPassword
                ? "Confirmed"
                : "Not confirmed"
            }
          />

          <p className="mt-3 text-xs leading-5 text-slate-400">
            The actual password is intentionally hidden from the review screen
            and is never stored in your Prisma school database.
          </p>
        </ReviewCard>

        {/* PROVISIONING PLAN */}

        <ReviewCard
          icon={
            BadgeCheck
          }
          title="Provisioning Plan"
        >
          <ProvisioningItem
            label="Create Clerk authentication identity"
          />

          <ProvisioningItem
            label="Create UserAccount record"
          />

          {data.primaryRole ===
          "teacher" ? (
            <ProvisioningItem
              label="Create Teacher school profile"
            />
          ) : null}

          {data.primaryRole ===
          "student" ? (
            <ProvisioningItem
              label="Create Student school profile"
            />
          ) : null}

          {data.primaryRole ===
          "parent" ? (
            <ProvisioningItem
              label="Create Parent / Guardian profile"
            />
          ) : null}

          {data.primaryRole ===
          "admin" ? (
            <ProvisioningItem
              label="Create Administrator profile"
            />
          ) : null}

          {data.primaryRole ===
          "account" ? (
            <ProvisioningItem
              label="Apply Accountant access profile"
            />
          ) : null}

          <ProvisioningItem
            label="Assign RBAC roles"
          />

          <ProvisioningItem
            label="Create access audit records"
          />
        </ReviewCard>
      </div>

      {/* ================================================================ */}
      {/* FINAL NOTICE                                                    */}
      {/* ================================================================ */}

      <div className="mt-6 rounded-[18px] border border-blue-100 bg-blue-50/70 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

          <div>
            <p className="text-xs font-black text-blue-900">
              Controlled provisioning
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Selecting Create User will run the complete validation again,
              create the Clerk identity, perform the local Prisma provisioning
              transaction, assign access roles and record the administrative
              action in the access audit trail.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                         SCHOOL PROFILE REVIEW                              */
/* -------------------------------------------------------------------------- */

function SchoolProfileReview({
  data,
}: {
  data:
    CreateUserWizardData;
}) {
  const profile =
    data.profile;

  switch (
    data.primaryRole
  ) {
    case "teacher":
      return (
        <ReviewCard
          icon={
            GraduationCap
          }
          title="Teacher Profile"
        >
          <ReviewRow
            label="Teacher ID"
            value={
              profileValue(
                profile.teacherID,
              )
            }
          />

          <ReviewRow
            label="Sex"
            value={
              formatSex(
                profile.sex,
              )
            }
          />

          <ReviewRow
            label="Birthday"
            value={
              profileValue(
                profile.birthday,
              )
            }
          />

          <ReviewRow
            label="Address"
            value={
              profileValue(
                profile.address,
              )
            }
          />

          <ReviewRow
            label="Subjects"
            value={
              Array.isArray(
                profile.subjectIds,
              )
                ? `${profile.subjectIds.length} selected`
                : "None selected"
            }
          />
        </ReviewCard>
      );

    case "student":
      return (
        <ReviewCard
          icon={
            School
          }
          title="Student Profile"
        >
          <ReviewRow
            label="Student ID"
            value={
              profileValue(
                profile.studentID,
              )
            }
          />

          <ReviewRow
            label="Sex"
            value={
              formatSex(
                profile.sex,
              )
            }
          />

          <ReviewRow
            label="Birthday"
            value={
              profileValue(
                profile.birthday,
              )
            }
          />

          <ReviewRow
            label="Address"
            value={
              profileValue(
                profile.address,
              )
            }
          />

          <ReviewRow
            label="Class"
            value={
              profile.classId
                ? `Class ID ${String(
                    profile.classId,
                  )}`
                : "Not selected"
            }
          />

          <ReviewRow
            label="Student Type"
            value={
              formatStudentType(
                profile.studentType,
              )
            }
          />

          <ReviewRow
            label="Boarding"
            value={
              formatBoardingType(
                profile.boardingType,
              )
            }
          />
        </ReviewCard>
      );

    case "parent":
      return (
        <ReviewCard
          icon={
            UsersRound
          }
          title="Parent Profile"
        >
          <ReviewRow
            label="Address"
            value={
              profileValue(
                profile.address,
              )
            }
          />

          <ReviewRow
            label="Linked Students"
            value={
              Array.isArray(
                profile.studentIds,
              )
                ? `${profile.studentIds.length} selected`
                : "None selected"
            }
          />
        </ReviewCard>
      );

    case "admin":
      return (
        <ReviewCard
          icon={
            Building2
          }
          title="Administrator Profile"
        >
          <p className="text-sm leading-6 text-slate-500">
            No additional school-profile information is currently required for
            administrator accounts.
          </p>
        </ReviewCard>
      );

    case "account":
      return (
        <ReviewCard
          icon={
            Building2
          }
          title="Finance Profile"
        >
          <p className="text-sm leading-6 text-slate-500">
            The accountant will use the universal UserAccount identity together
            with the Accountant RBAC role. No separate finance profile record
            is currently required.
          </p>
        </ReviewCard>
      );

    default:
      return (
        <ReviewCard
          icon={
            MapPin
          }
          title="School Profile"
        >
          <p className="text-sm font-semibold text-slate-400">
            No school profile available.
          </p>
        </ReviewCard>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                              REVIEW CARD                                   */
/* -------------------------------------------------------------------------- */

function ReviewCard({
  icon: Icon,
  title,
  children,
}: {
  icon:
    typeof UserRound;

  title:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-5 transition hover:border-slate-300">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
          {
            title
          }
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {
          children
        }
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                               REVIEW ROW                                   */
/* -------------------------------------------------------------------------- */

function ReviewRow({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-xs font-semibold text-slate-400">
        {
          label
        }
      </span>

      <span className="break-words text-sm font-black text-slate-800 sm:max-w-[65%] sm:text-right">
        {
          value
        }
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          PROVISIONING ITEM                                 */
/* -------------------------------------------------------------------------- */

function ProvisioningItem({
  label,
}: {
  label:
    string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <CheckCircle2 className="h-3 w-3" />
      </span>

      <span className="text-xs font-bold text-slate-700">
        {
          label
        }
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FORMATTERS                                    */
/* -------------------------------------------------------------------------- */

function profileValue(
  value:
    unknown,
) {
  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  if (
    typeof value ===
    "number"
  ) {
    return String(
      value,
    );
  }

  return "Not supplied";
}

function formatSex(
  value:
    unknown,
) {
  if (
    value ===
    "MALE"
  ) {
    return "Male";
  }

  if (
    value ===
    "FEMALE"
  ) {
    return "Female";
  }

  return "Not supplied";
}

function formatStudentType(
  value:
    unknown,
) {
  if (
    value ===
    "new"
  ) {
    return "New Student";
  }

  if (
    value ===
    "old"
  ) {
    return "Existing Student";
  }

  return "Not supplied";
}

function formatBoardingType(
  value:
    unknown,
) {
  if (
    value ===
    "boarder"
  ) {
    return "Boarder";
  }

  if (
    value ===
    "day"
  ) {
    return "Day Student";
  }

  return "Not supplied";
}

/* -------------------------------------------------------------------------- */
/*                         ACCOUNT LABEL                                      */
/* -------------------------------------------------------------------------- */

function getAccountLabel(
  role:
    CreateUserWizardData["primaryRole"],
) {
  switch (
    role
  ) {
    case "admin":
      return "Administrator";

    case "teacher":
      return "Teacher";

    case "student":
      return "Student";

    case "parent":
      return "Parent / Guardian";

    case "account":
      return "Accountant / Bursar";

    default:
      return "No Account Type";
  }
}