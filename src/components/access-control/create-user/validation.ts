import type {
  CreateUserWizardData,
} from "./types";

export type WizardValidationErrors =
  Record<
    string,
    string
  >;

export type WizardValidationResult = {
  valid:
    boolean;

  errors:
    WizardValidationErrors;
};

/* -------------------------------------------------------------------------- */
/*                               HELPERS                                      */
/* -------------------------------------------------------------------------- */

function result(
  errors:
    WizardValidationErrors,
): WizardValidationResult {
  return {
    valid:
      Object.keys(
        errors,
      ).length ===
      0,

    errors,
  };
}

function getProfileString(
  data:
    CreateUserWizardData,

  key:
    string,
) {
  const value =
    data.profile[
      key
    ];

  return typeof value ===
    "string"
    ? value
    : "";
}

function getProfileNumber(
  data:
    CreateUserWizardData,

  key:
    string,
) {
  const value =
    data.profile[
      key
    ];

  return typeof value ===
    "number"
    ? value
    : null;
}

/* -------------------------------------------------------------------------- */
/* STEP 1 — ACCOUNT TYPE                                                      */
/* -------------------------------------------------------------------------- */

export function validateAccountTypeStep(
  data:
    CreateUserWizardData,
) {
  const errors:
    WizardValidationErrors =
    {};

  if (
    !data.primaryRole
  ) {
    errors.primaryRole =
      "Select an account type before continuing.";
  }

  return result(
    errors,
  );
}

/* -------------------------------------------------------------------------- */
/* STEP 2 — IDENTITY                                                          */
/* -------------------------------------------------------------------------- */

export function validateIdentityStep(
  data:
    CreateUserWizardData,
) {
  const errors:
    WizardValidationErrors =
    {};

  if (
    !data.firstName.trim()
  ) {
    errors.firstName =
      "First name is required.";
  }

  if (
    !data.lastName.trim()
  ) {
    errors.lastName =
      "Last name is required.";
  }

  if (
    !data.email.trim()
  ) {
    errors.email =
      "Email address is required.";
  } else {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        data.email.trim(),
      )
    ) {
      errors.email =
        "Enter a valid email address.";
    }
  }

  if (
    !data.username.trim()
  ) {
    errors.username =
      "Username is required.";
  } else if (
    data.username
      .trim()
      .length <
    3
  ) {
    errors.username =
      "Username must contain at least 3 characters.";
  }

  /*
   * Phone is optional generally.
   *
   * Parent-specific phone validation can be enforced
   * either here or in School Profile / server validation.
   */
  if (
    data.primaryRole ===
        "parent" &&
    !data.phone.trim()
    ) {
    errors.phone =
        "A phone number is required for parent accounts.";
    }

  return result(
    errors,
  );
}

/* -------------------------------------------------------------------------- */
/* STEP 3 — SCHOOL PROFILE                                                    */
/* -------------------------------------------------------------------------- */

export function validateSchoolProfileStep(
  data:
    CreateUserWizardData,
) {
  const errors:
    WizardValidationErrors =
    {};

  switch (
    data.primaryRole
  ) {
    /* -------------------------------------------------------------------- */
    /* STUDENT                                                              */
    /* -------------------------------------------------------------------- */

    case "student": {
      const studentID =
        getProfileString(
          data,
          "studentID",
        );

      const classId =
        getProfileNumber(
          data,
          "classId",
        );

      const sex =
        getProfileString(
          data,
          "sex",
        );

      const birthday =
        getProfileString(
          data,
          "birthday",
        );

      const address =
        getProfileString(
          data,
          "address",
        );

      const studentType =
        getProfileString(
          data,
          "studentType",
        );

      const boardingType =
        getProfileString(
          data,
          "boardingType",
        );

      if (
        !studentID.trim()
      ) {
        errors.studentID =
          "Student ID is required.";
      }

      if (
        !classId
      ) {
        errors.classId =
          "Select the student's class.";
      }

      /*
       * We do NOT validate gradeId here.
       *
       * Your new provisioning adapter derives gradeId
       * from the selected class on the server.
       *
       * This is safer than accepting classId + gradeId
       * independently from the browser.
       */

      if (
        !sex
      ) {
        errors.sex =
          "Select the student's sex.";
      }

      if (
        !birthday
      ) {
        errors.birthday =
          "Date of birth is required.";
      }

      if (
        !address.trim()
      ) {
        errors.address =
          "Address is required.";
      }

      if (
        !studentType
      ) {
        errors.studentType =
          "Select the student type.";
      }

      if (
        !boardingType
      ) {
        errors.boardingType =
          "Select the boarding type.";
      }

      /*
       * parentId remains optional because your
       * Student model permits parentId = null.
       */

      break;
    }

    /* -------------------------------------------------------------------- */
    /* TEACHER                                                              */
    /* -------------------------------------------------------------------- */

    case "teacher": {
      const teacherID =
        getProfileString(
          data,
          "teacherID",
        );

      const sex =
        getProfileString(
          data,
          "sex",
        );

      const birthday =
        getProfileString(
          data,
          "birthday",
        );

      const address =
        getProfileString(
          data,
          "address",
        );

      if (
        !teacherID.trim()
      ) {
        errors.teacherID =
          "Teacher ID is required.";
      }

      if (
        !sex
      ) {
        errors.sex =
          "Select the teacher's sex.";
      }

      if (
        !birthday
      ) {
        errors.birthday =
          "Date of birth is required.";
      }

      if (
        !address.trim()
      ) {
        errors.address =
          "Address is required.";
      }

      /*
       * Subjects are optional in the adapter we built.
       *
       * If you later decide every teacher must have
       * at least one subject, we can enforce that here
       * and in the server schema too.
       */

      break;
    }

    /* -------------------------------------------------------------------- */
    /* PARENT                                                               */
    /* -------------------------------------------------------------------- */

    case "parent": {
      const address =
        getProfileString(
          data,
          "address",
        );

      if (
        !address.trim()
      ) {
        errors.address =
          "Address is required.";
      }

     
      /*
       * studentIds remains optional.
       *
       * A parent may be created before children
       * are linked.
       */

      break;
    }

    /* -------------------------------------------------------------------- */
    /* ADMIN / ACCOUNT                                                       */
    /* -------------------------------------------------------------------- */

    case "admin":
    case "account":
    default:
      /*
       * No additional domain fields are currently
       * required for these identities.
       */
      break;
  }

  return result(
    errors,
  );
}

/* -------------------------------------------------------------------------- */
/* STEP 4 — ACCESS ROLES                                                      */
/* -------------------------------------------------------------------------- */

export function validateRolesStep(
  data:
    CreateUserWizardData,
) {
  const errors:
    WizardValidationErrors =
    {};

  if (
    !data.primaryRole
  ) {
    errors.roleIds =
      "A primary application role is required.";

    return result(
      errors,
    );
  }

  if (
    data.roleIds.length ===
    0
  ) {
    errors.roleIds =
      "Assign at least one access role.";
  }

  return result(
    errors,
  );
}

/* -------------------------------------------------------------------------- */
/* STEP 5 — ACCOUNT SETUP                                                     */
/* -------------------------------------------------------------------------- */

export function validateAccountSetupStep(
  data:
    CreateUserWizardData,
) {
  const errors:
    WizardValidationErrors =
    {};

  if (
    !data.password
  ) {
    errors.password =
      "Password is required.";
  } else if (
    data.password.length <
    8
  ) {
    errors.password =
      "Password must contain at least 8 characters.";
  }

  /*
   * We currently validate only password because
   * CreateUserWizardData does not yet contain
   * confirmPassword.
   *
   * We'll add confirmation properly below.
   */
   if (
    !data.confirmPassword
  ) {
    errors.confirmPassword =
      "Confirm the password.";
  } else if (
    data.password !==
    data.confirmPassword
  ) {
    errors.confirmPassword =
      "The passwords do not match.";
  }


  return result(
    errors,
  );
}

/* -------------------------------------------------------------------------- */
/* VALIDATE INDIVIDUAL STEP                                                   */
/* -------------------------------------------------------------------------- */

export function validateWizardStep(
  step:
    number,

  data:
    CreateUserWizardData,
): WizardValidationResult {
  /*
   * IMPORTANT:
   *
   * Your CreateUserWizard currently uses zero-based
   * steps:
   *
   * 0 = Account Type
   * 1 = Identity
   * 2 = School Profile
   * 3 = Roles
   * 4 = Account Setup
   * 5 = Review
   */

  switch (
    step
  ) {
    case 0:
      return validateAccountTypeStep(
        data,
      );

    case 1:
      return validateIdentityStep(
        data,
      );

    case 2:
      return validateSchoolProfileStep(
        data,
      );

    case 3:
      return validateRolesStep(
        data,
      );

    case 4:
      return validateAccountSetupStep(
        data,
      );

    default:
      return result(
        {},
      );
  }
}

/* -------------------------------------------------------------------------- */
/* COMPLETE WIZARD VALIDATION                                                 */
/* -------------------------------------------------------------------------- */

export function validateEntireWizard(
  data:
    CreateUserWizardData,
): WizardValidationResult {
  const validators = [
    validateAccountTypeStep,
    validateIdentityStep,
    validateSchoolProfileStep,
    validateRolesStep,
    validateAccountSetupStep,
  ];

  const errors:
    WizardValidationErrors =
    {};

  for (
    const validate of
    validators
  ) {
    Object.assign(
      errors,
      validate(
        data,
      ).errors,
    );
  }

  return result(
    errors,
  );
}