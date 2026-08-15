import {
  z,
} from "zod";

/* -------------------------------------------------------------------------- */
/*                                COMMON                                      */
/* -------------------------------------------------------------------------- */

const sexSchema =
  z.enum([
    "MALE",
    "FEMALE",
  ]);

/* -------------------------------------------------------------------------- */
/*                               TEACHER                                      */
/* -------------------------------------------------------------------------- */

export const teacherProvisioningProfileSchema =
  z.object({
    address:
      z
        .string()
        .trim()
        .min(
          1,
          "Teacher address is required.",
        ),

    teacherID:
      z
        .string()
        .trim()
        .min(
          1,
          "Teacher ID is required.",
        ),

    birthday:
      z.coerce.date({
        message:
          "Teacher birthday is required.",
      }),

    sex:
      sexSchema,

    subjectIds:
      z
        .array(
          z
            .number()
            .int()
            .positive(),
        )
        .default([]),
  });

export type TeacherProvisioningProfile =
  z.infer<
    typeof teacherProvisioningProfileSchema
  >;

/* -------------------------------------------------------------------------- */
/*                               STUDENT                                      */
/* -------------------------------------------------------------------------- */

export const studentProvisioningProfileSchema =
  z.object({
    address:
      z
        .string()
        .trim()
        .min(
          1,
          "Student address is required.",
        ),

    studentID:
      z
        .string()
        .trim()
        .min(
          1,
          "Student ID is required.",
        ),

    birthday:
      z.coerce.date({
        message:
          "Student birthday is required.",
      }),

    sex:
      sexSchema,

    /*
     * We intentionally accept ONLY classId.
     *
     * gradeId will be derived from the selected
     * Class on the server so a forged client
     * cannot submit mismatched class + grade.
     */
    classId:
      z
        .number()
        .int()
        .positive(),

    parentId:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

    studentType:
      z.enum([
        "new",
        "old",
      ]),

    boardingType:
      z.enum([
        "boarder",
        "day",
      ]),
  });

export type StudentProvisioningProfile =
  z.infer<
    typeof studentProvisioningProfileSchema
  >;

/* -------------------------------------------------------------------------- */
/*                                PARENT                                      */
/* -------------------------------------------------------------------------- */

export const parentProvisioningProfileSchema =
  z.object({
    address:
      z
        .string()
        .trim()
        .min(
          1,
          "Parent address is required.",
        ),

    studentIds:
      z
        .array(
          z.string(),
        )
        .default([]),
  });

export type ParentProvisioningProfile =
  z.infer<
    typeof parentProvisioningProfileSchema
  >;

/* -------------------------------------------------------------------------- */
/*                                ADMIN                                       */
/* -------------------------------------------------------------------------- */

export const adminProvisioningProfileSchema =
  z.object({
    /*
     * Your current Admin model only contains
     * id, username and img.
     */
    imageUrl:
      z
        .string()
        .trim()
        .optional()
        .nullable(),
  });

/* -------------------------------------------------------------------------- */
/*                              ACCOUNT                                       */
/* -------------------------------------------------------------------------- */

/*
 * There is currently no Account Prisma model.
 *
 * The UserAccount record + accountant RBAC role
 * IS the account profile for this phase.
 */
export const accountProvisioningProfileSchema =
  z.object({});