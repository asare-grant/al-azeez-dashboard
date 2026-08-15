import { z } from "zod";

const primaryRoleSchema = z.enum([
  "admin",
  "teacher",
  "student",
  "parent",
  "account",
]);

export const provisioningIdentitySchema = z.object({
  firstName: z.string().trim().min(2, "First name is required.").max(100),

  lastName: z.string().trim().min(2, "Last name is required.").max(100),

  email: z.string().trim().email("Enter a valid email address.").max(255),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .nullable()
    .transform((value) => (value?.trim() ? value.trim() : null)),

  username: z
    .string()
    .trim()
    .min(3, "Username must contain at least 3 characters.")
    .max(20, "Username must contain at most 20 characters."),

  imageUrl: z
    .union([
      z.string().trim().url("Enter a valid profile image URL."),

      z.literal(""),

      z.null(),

      z.undefined(),
    ])
    .transform((value) => (value ? value : null)),
});

export const provisioningAccessSchema = z.object({
  primaryRole: primaryRoleSchema,

  roleIds: z
    .array(z.number().int().positive())
    .min(1, "At least one access role is required."),
});

export const provisioningAccountSchema = z.object({
  password: z
    .string()
    .min(8, "The temporary password must contain at least 8 characters.")
    .max(100),
});

export const createUserProvisioningSchema = z.object({
  identity: provisioningIdentitySchema,

  access: provisioningAccessSchema,

  account: provisioningAccountSchema,

  profile: z.unknown(),
});

export type CreateUserProvisioningData = z.infer<
  typeof createUserProvisioningSchema
>;
