import type {
  PrimaryApplicationRole,
} from "@/lib/access-control/provisioning-types";

export type CreateUserWizardData = {
  primaryRole:
    PrimaryApplicationRole |
    null;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  phone:
    string;

  username:
    string;

  imageUrl:
    string;

  password:
  string;

confirmPassword:
  string;

  roleIds:
    number[];

  profile:
    Record<
      string,
      unknown
    >;
};

export const initialCreateUserWizardData:
  CreateUserWizardData = {
  primaryRole:
    null,

  firstName:
    "",

  lastName:
    "",

  email:
    "",

  phone:
    "",

  username:
    "",

  imageUrl:
    "",

  password:
    "",

  confirmPassword:
    "",

  roleIds:
    [],

  profile:
    {},
};