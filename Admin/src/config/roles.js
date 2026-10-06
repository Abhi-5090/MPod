// Role groups. These MUST match the backend's role checks.
export const PLATFORM = ["superadmin", "admin"]
export const TENANT = ["tenantadmin", "placementadmin", "trainer"]
export const ALL_STAFF = [...PLATFORM, ...TENANT]

// Feature -> roles allowed. Used by both the route table and the sidebar.
export const ROLES = {
  dashboard: ALL_STAFF,
  interviews: ALL_STAFF,
  users: [...PLATFORM, "tenantadmin"],
  kiosk: [...PLATFORM, "tenantadmin"],
  // Credit history: platform (all tenants, can add credits) + tenantadmin (own tenant, read only)
  tenantCredits: [...PLATFORM, "tenantadmin"],
  tenants: PLATFORM,
  technologies: PLATFORM,
  modules: PLATFORM,
  topics: PLATFORM,
  interviewQuestions: PLATFORM,
  companyQuestions: PLATFORM,
  codingQuestions: PLATFORM,
  companies: PLATFORM,
  tags: PLATFORM,
}

export const isPlatformRole = role => PLATFORM.includes(role)
export const hasRole = (user, roles) => !!(user && roles && roles.includes(user.role))

// Whether `viewerRole` may edit/deactivate a user with `targetRole` (mirrors backend checks).
// Tenant staff may only manage students; platform roles may manage everyone except
// admin/superadmin accounts, which only a superadmin may manage.
export const canManageUserRole = (viewerRole, targetRole) => {
  if (!isPlatformRole(viewerRole)) return !ALL_STAFF.includes(targetRole)
  if (PLATFORM.includes(targetRole)) return viewerRole === "superadmin"
  return true
}
