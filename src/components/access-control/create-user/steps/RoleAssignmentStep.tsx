// "use client";

// import {
//   Check,
//   KeyRound,
//   LockKeyhole,
// } from "lucide-react";

// import type {
//   CreateUserWizardData,
// } from "../types";

// import type {
//   WizardValidationErrors,
// } from "../validation";

// export default function RoleAssignmentStep({
//   data,
//   patch,
//   roles,
//   errors,
// }: {
//   data:
//     CreateUserWizardData;

//   patch:
//     (
//       values:
//         Partial<
//           CreateUserWizardData
//         >,
//     ) => void;

//   roles:
//     {
//       id:
//         number;

//       key:
//         string;

//       name:
//         string;

//       description:
//         string | null;

//       type:
//         "SYSTEM" |
//         "CUSTOM";

//       isProtected:
//         boolean;

//       _count: {
//         permissions:
//           number;
//       };
//     }[];

//   errors:
//     WizardValidationErrors;
// }) {
//   const requiredKey =
//     data.primaryRole ===
//     "account"
//       ? "accountant"
//       : data.primaryRole;

//   function toggle(
//     roleId:
//       number,

//     key:
//       string,
//   ) {
//     /*
//      * Primary role cannot be deselected.
//      */
//     if (
//       key ===
//       requiredKey
//     ) {
//       return;
//     }

//     const selected =
//       data.roleIds.includes(
//         roleId,
//       );

//     patch({
//       roleIds:
//         selected
//           ? data.roleIds.filter(
//               (
//                 id,
//               ) =>
//                 id !==
//                 roleId,
//             )
//           : [
//               ...data.roleIds,
//               roleId,
//             ],
//     });
//   }

//   return (
//     <>
//       <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
//         Step 4
//       </p>

//       <h2 className="mt-2 text-2xl font-black text-slate-950">
//         Roles & access
//       </h2>

//       <p className="mt-2 text-sm leading-6 text-slate-500">
//         The primary role is mandatory. Additional system or custom roles may
//         provide extra capabilities.
//       </p>

//       <div className="mt-6 grid gap-3 md:grid-cols-2">
//         {roles.map(
//           (
//             role,
//           ) => {
//             const selected =
//               data.roleIds.includes(
//                 role.id,
//               );

//             const required =
//               role.key ===
//               requiredKey;

//             return (
//               <button
//                 key={
//                   role.id
//                 }
//                 type="button"
//                 onClick={() =>
//                   toggle(
//                     role.id,

//                     role.key,
//                   )
//                 }
//                 className={`rounded-[18px] border p-4 text-left transition ${
//                   selected
//                     ? "border-blue-300 bg-blue-50"
//                     : "border-slate-200 hover:border-blue-200"
//                 }`}
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
//                     <KeyRound className="h-4 w-4" />
//                   </div>

//                   <span
//                     className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
//                       selected
//                         ? "border-blue-600 bg-blue-600 text-white"
//                         : "border-slate-300"
//                     }`}
//                   >
//                     {selected ? (
//                       <Check className="h-3.5 w-3.5" />
//                     ) : null}
//                   </span>
//                 </div>

//                 <h3 className="mt-4 font-black text-slate-900">
//                   {
//                     role.name
//                   }
//                 </h3>

//                 <p className="mt-1 text-xs leading-5 text-slate-500">
//                   {role.description ??
//                     `${role._count.permissions} permissions`}
//                 </p>

//                 <div className="mt-3 flex flex-wrap gap-1.5">
//                   <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase text-slate-500">
//                     {
//                       role.type
//                     }
//                   </span>

//                   {required ? (
//                     <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase text-emerald-700">
//                       <LockKeyhole className="h-2.5 w-2.5" />

//                       Required
//                     </span>
//                   ) : null}
//                 </div>
//               </button>
//             );
//           },
//         )}
//       </div>
//     </>
//   );
// }






"use client";

import {
  AlertCircle,
  Check,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import type {
  CreateUserWizardData,
} from "../types";

import type {
  WizardValidationErrors,
} from "../validation";

export default function RoleAssignmentStep({
  data,
  patch,
  roles,
  errors,
}: {
  data:
    CreateUserWizardData;

  patch:
    (
      values:
        Partial<
          CreateUserWizardData
        >,
    ) => void;

  roles:
    {
      id:
        number;

      key:
        string;

      name:
        string;

      description:
        string | null;

      type:
        "SYSTEM" |
        "CUSTOM";

      isProtected:
        boolean;

      _count: {
        permissions:
          number;
      };
    }[];

  errors:
    WizardValidationErrors;
}) {
  const requiredKey =
    data.primaryRole ===
    "account"
      ? "accountant"
      : data.primaryRole;

  const requiredRole =
    roles.find(
      (
        role,
      ) =>
        role.key ===
        requiredKey,
    );

  function toggle(
    roleId:
      number,

    key:
      string,
  ) {
    /*
     * The base RBAC role that corresponds to
     * the selected primary application identity
     * cannot be removed.
     */
    if (
      key ===
      requiredKey
    ) {
      return;
    }

    const selected =
      data.roleIds.includes(
        roleId,
      );

    patch({
      roleIds:
        selected
          ? data.roleIds.filter(
              (
                id,
              ) =>
                id !==
                roleId,
            )
          : [
              ...data.roleIds,
              roleId,
            ],
    });
  }

  return (
    <>
      {/* HEADER */}

      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Step 4
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Roles & access
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        The user's primary role is mandatory. You may add one or more
        additional system or custom roles to extend their permissions.
      </p>

      {/* REQUIRED BASE ROLE SUMMARY */}

      {requiredRole ? (
        <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-600">
              Required base role
            </p>

            <p className="mt-1 font-black text-emerald-950">
              {requiredRole.name}
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              This role is automatically assigned from the selected account
              type and cannot be removed.
            </p>
          </div>
        </div>
      ) : null}

      {/* VALIDATION */}

      {errors.roleIds ? (
        <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

          <div>
            <p className="text-xs font-black text-red-700">
              Access role required
            </p>

            <p className="mt-1 text-[11px] leading-5 text-red-600">
              {errors.roleIds}
            </p>
          </div>
        </div>
      ) : null}

      {/* ROLE CARDS */}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {roles.map(
          (
            role,
          ) => {
            const selected =
              data.roleIds.includes(
                role.id,
              );

            const required =
              role.key ===
              requiredKey;

            return (
              <button
                key={
                  role.id
                }
                type="button"
                aria-pressed={
                  selected
                }
                onClick={() =>
                  toggle(
                    role.id,

                    role.key,
                  )
                }
                className={`group relative overflow-hidden rounded-[20px] border p-4 text-left transition-all duration-200 ${
                  selected
                    ? "border-blue-300 bg-blue-50 shadow-[0_14px_32px_rgba(37,99,235,0.08)]"
                    : errors.roleIds
                      ? "border-red-200 bg-white hover:border-red-300"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                } ${
                  required
                    ? "cursor-default"
                    : ""
                }`}
              >
                {selected ? (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-200/40 blur-2xl" />
                ) : null}

                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-950 text-white group-hover:bg-blue-700"
                    }`}
                  >
                    <KeyRound className="h-4 w-4" />
                  </div>

                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {selected ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : null}
                  </span>
                </div>

                <div className="relative">
                  <h3 className="mt-4 font-black text-slate-900">
                    {
                      role.name
                    }
                  </h3>

                  <p className="mt-1 min-h-[40px] text-xs leading-5 text-slate-500">
                    {role.description ??
                      `${role._count.permissions} permissions`}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500">
                      {
                        role.type
                      }
                    </span>

                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-blue-700">
                      {
                        role._count
                          .permissions
                      }{" "}
                      permissions
                    </span>

                    {required ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                        <LockKeyhole className="h-2.5 w-2.5" />

                        Required
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          },
        )}
      </div>

      {/* SELECTION SUMMARY */}

      <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Access profile
            </p>

            <p className="mt-1 text-sm font-black text-slate-800">
              {data.roleIds.length} role
              {data.roleIds.length ===
              1
                ? ""
                : "s"}{" "}
              selected
            </p>
          </div>

          <p className="text-xs font-bold text-slate-400">
            Required + optional access
          </p>
        </div>
      </div>
    </>
  );
}