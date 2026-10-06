// Central role definitions. Anything not listed as staff is treated as a student.
const PLATFORM_ROLES = ["superadmin", "admin"]; // Technical Hub staff, cross-tenant
const TENANT_STAFF_ROLES = ["tenantadmin", "placementadmin", "trainer"]; // college staff, own tenant only
const STAFF_ROLES = [...PLATFORM_ROLES, ...TENANT_STAFF_ROLES];

// Roles that may be assigned through user import / edit, keyed by who is assigning.
const ASSIGNABLE_ROLES = {
  platform: ["student", ...TENANT_STAFF_ROLES],
  tenantadmin: ["student"],
};

const isStaffRole = (role) => STAFF_ROLES.includes(role);
const isPlatformRole = (role) => PLATFORM_ROLES.includes(role);

// Who may do what (used by routes). Keep in sync with Admin/src/routes role config.
const CAN = {
  manageTenants: PLATFORM_ROLES,
  manageContent: PLATFORM_ROLES,
  viewContent: STAFF_ROLES,
  manageUsers: [...PLATFORM_ROLES, "tenantadmin"],
  scheduleInterviews: STAFF_ROLES,
  viewTenantStats: STAFF_ROLES,
  viewPlatformStats: PLATFORM_ROLES,
  manageKiosks: [...PLATFORM_ROLES, "tenantadmin"],
  viewCredits: [...PLATFORM_ROLES, "tenantadmin"],
  manageCredits: PLATFORM_ROLES,
};

module.exports = {
  PLATFORM_ROLES,
  TENANT_STAFF_ROLES,
  STAFF_ROLES,
  ASSIGNABLE_ROLES,
  CAN,
  isStaffRole,
  isPlatformRole,
};
