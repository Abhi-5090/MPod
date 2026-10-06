import { ROLES } from "./roles"

// Sidebar menu. Each group is shown only to the roles listed (same role
// lists as the route table in routes/allRoutes.js). `to` may be a function
// of the current user.
const MENU = [
  {
    section: null,
    groups: [
      {
        title: "Dashboard",
        icon: "dashboard.svg",
        roles: ROLES.dashboard,
        items: [{ label: "Dashboard", to: "/dashboard" }],
      },
    ],
  },
  {
    section: "Users",
    groups: [
      {
        title: "Tenants",
        icon: "users.svg",
        roles: ROLES.tenants,
        items: [
          { label: "Tenants List", to: "/tenants-list" },
          { label: "Add Tenant", to: "/add-tenant" },
        ],
      },
      {
        title: "Users",
        icon: "users.svg",
        roles: ROLES.users,
        items: [
          { label: "Users List", to: "/users-list" },
          { label: "Add Users", to: "/add-user" },
          { label: "Update Profile pics", to: "/users-profile-pics-list" },
        ],
      },
      {
        title: "Kiosk Devices",
        icon: "platform.svg",
        roles: ROLES.kiosk,
        items: [{ label: "Kiosk Devices", to: "/kiosk-devices" }],
      },
      {
        // Platform roles reach credits through the Tenants list.
        title: "Credits",
        icon: "tests.svg",
        roles: ["tenantadmin"],
        items: [{ label: "Credit History", to: user => `/tenant-credits/${user.t_id}` }],
      },
    ],
  },
  {
    section: "Content",
    groups: [
      {
        title: "Technologies",
        icon: "technologies.svg",
        roles: ROLES.technologies,
        items: [{ label: "Technologies List", to: "/technologies-list" }],
      },
      {
        title: "Modules",
        icon: "modules.svg",
        roles: ROLES.modules,
        items: [{ label: "Modules List", to: "/modules-list" }],
      },
      {
        title: "Topics",
        icon: "Topics.svg",
        roles: ROLES.topics,
        items: [{ label: "Topics List", to: "/topics-list" }],
      },
      {
        title: "Questions",
        icon: "coding questions.svg",
        roles: ROLES.interviewQuestions,
        items: [
          { label: "Interview Questions", to: "/interview-questions-list" },
          { label: "Company Questions", to: "/companies-questions-list" },
          { label: "Coding Questions", to: "/coding-questions-list" },
        ],
      },
      {
        title: "Companies",
        icon: "company.svg",
        roles: ROLES.companies,
        items: [{ label: "Companies List", to: "/companies-list" }],
      },
      {
        title: "Tags",
        icon: "tags.svg",
        roles: ROLES.tags,
        items: [{ label: "Tags List", to: "/tags-list" }],
      },
    ],
  },
  {
    section: "Interview",
    groups: [
      {
        title: "Interviews",
        icon: "interview.png",
        roles: ROLES.interviews,
        items: [
          { label: "Interviews List", to: "/ai-interviews-list" },
          { label: "Company Interviews List", to: "/company-interviews-list" },
          { label: "Coding Interviews List", to: "/coding-interviews-list" },
        ],
      },
    ],
  },
]

// Returns the menu filtered for `user`, with `to` resolved to strings.
export const getMenuForUser = user => {
  if (!user) return []
  return MENU.map(section => ({
    section: section.section,
    groups: section.groups
      .filter(group => group.roles.includes(user.role))
      .map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          to: typeof item.to === "function" ? item.to(user) : item.to,
        })),
      })),
  })).filter(section => section.groups.length > 0)
}

export default MENU
