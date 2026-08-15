export {
  getCurrentAccessContext,
} from "./context";

export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  contextHasPermission,
  contextHasAnyPermission,
  contextHasAllPermissions,
} from "./permissions";

export {
  requireActiveAccessContext,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
} from "./guards";

export {
  hasRole,
  contextHasRole,
  contextHasAnyRole,
} from "./roles";

export {
  syncCurrentUserAccessIdentity,
} from "./sync-current-user";

export {
  AccessDeniedError,
  AccountInactiveError,
} from "./errors";

export type {
  AccessContext,
  AccessRoleSummary,
} from "./types";