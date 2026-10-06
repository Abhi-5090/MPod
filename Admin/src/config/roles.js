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
