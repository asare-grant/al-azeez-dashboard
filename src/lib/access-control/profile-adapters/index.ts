import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import type {
  PrimaryApplicationRole,
} from "../provisioning-types";

import {
  createStudentProvisioningProfile,
} from "./student";

import {
  createTeacherProvisioningProfile,
} from "./teacher";

import {
  createParentProvisioningProfile,
} from "./parent";

import {
  createAdminProvisioningProfile,
} from "./admin";

import {
  createAccountProvisioningProfile,
} from "./account";

type ProvisioningIdentity = {
  username:
    string | null;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  phone:
    string | null;

  imageUrl:
    string | null;
};

export async function createProvisionedSchoolProfile({
  role,
  userId,
  identity,
  profile,
  tx,
}: {
  role:
    PrimaryApplicationRole;

  userId:
    string;

  identity:
    ProvisioningIdentity;

  profile:
    unknown;

  tx:
    Prisma.TransactionClient;
}) {
  switch (
    role
  ) {
    case "student":
      return createStudentProvisioningProfile({
        userId,
        identity,
        profile,
        tx,
      });

    case "teacher":
      return createTeacherProvisioningProfile({
        userId,
        identity,
        profile,
        tx,
      });

    case "parent":
      return createParentProvisioningProfile({
        userId,
        identity,
        profile,
        tx,
      });

    case "admin":
      return createAdminProvisioningProfile({
        userId,
        identity,
        profile,
        tx,
      });

    case "account":
      return createAccountProvisioningProfile({
        userId,
        identity,
        profile,
        tx,
      });
  }
}