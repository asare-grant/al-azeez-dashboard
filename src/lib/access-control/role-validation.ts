import {
  z,
} from "zod";

/* -------------------------------------------------------------------------- */
/*                               ROLE KEY                                     */
/* -------------------------------------------------------------------------- */

const roleKeySchema =
  z
    .string()
    .trim()
    .min(
      2,
      "Role key is required.",
    )
    .max(
      60,
      "Role key is too long.",
    )
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Use lowercase letters, numbers and underscores only.",
    );

/* -------------------------------------------------------------------------- */
/*                           CREATE CUSTOM ROLE                               */
/* -------------------------------------------------------------------------- */

export const createAccessRoleSchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Role name is required.",
        )
        .max(
          100,
        ),

    key:
      roleKeySchema,

    description:
      z
        .string()
        .trim()
        .max(
          500,
        )
        .optional()
        .nullable(),

    permissionIds:
      z
        .array(
          z
            .number()
            .int()
            .positive(),
        )
        .default([]),
  });

export type CreateAccessRoleInput =
  z.infer<
    typeof createAccessRoleSchema
  >;

/* -------------------------------------------------------------------------- */
/*                            UPDATE ROLE                                     */
/* -------------------------------------------------------------------------- */

export const updateAccessRoleSchema =
  z.object({
    roleId:
      z
        .number()
        .int()
        .positive(),

    name:
      z
        .string()
        .trim()
        .min(
          2,
        )
        .max(
          100,
        ),

    description:
      z
        .string()
        .trim()
        .max(
          500,
        )
        .optional()
        .nullable(),
  });

/* -------------------------------------------------------------------------- */
/*                       UPDATE ROLE PERMISSIONS                              */
/* -------------------------------------------------------------------------- */

export const updateRolePermissionsSchema =
  z.object({
    roleId:
      z
        .number()
        .int()
        .positive(),

    permissionIds:
      z
        .array(
          z
            .number()
            .int()
            .positive(),
        ),
  });

/* -------------------------------------------------------------------------- */
/*                              CLONE ROLE                                    */
/* -------------------------------------------------------------------------- */

export const cloneAccessRoleSchema =
  z.object({
    sourceRoleId:
      z
        .number()
        .int()
        .positive(),

    name:
      z
        .string()
        .trim()
        .min(
          2,
        )
        .max(
          100,
        ),

    key:
      roleKeySchema,

    description:
      z
        .string()
        .trim()
        .max(
          500,
        )
        .optional()
        .nullable(),
  });