import {
  Bell,
  Building2,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Users,
  Wallet,
} from "lucide-react";

const managementRoles = ["OWNER", "ADMIN", "MANAGER"];
const adminRoles = ["OWNER", "ADMIN"];

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        path: "/owner/dashboard",
        icon: LayoutDashboard,
        roles: managementRoles,
      },
      {
        label: "My dashboard",
        path: "/employee/dashboard",
        icon: LayoutDashboard,
        roles: ["EMPLOYEE"],
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Employees",
        path: "/owner/employees",
        icon: Users,
        roles: managementRoles,
      },
      {
        label: "Departments",
        path: "/owner/departments",
        icon: Building2,
        roles: managementRoles,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Attendance",
        path: "/workspace/attendance",
        icon: CalendarCheck,
        roles: [...managementRoles, "EMPLOYEE"],
      },
      {
        label: "Leave",
        path: "/workspace/leaves",
        icon: CalendarCheck,
        roles: [...managementRoles, "EMPLOYEE"],
      },
      {
        label: "Tasks",
        path: "/workspace/tasks",
        icon: ClipboardList,
        roles: [...managementRoles, "EMPLOYEE"],
      },
      {
        label: "Notices",
        path: "/workspace/notices",
        icon: Megaphone,
        roles: [...managementRoles, "EMPLOYEE"],
      },
      {
        label: "Payroll",
        path: "/workspace/payroll",
        icon: Wallet,
        roles: [...managementRoles, "EMPLOYEE"],
      },
    ],
  },
  {
    label: "Personal",
    items: [
      {
        label: "Notifications",
        path: "/workspace/notifications",
        icon: Bell,
        roles: [...managementRoles, "EMPLOYEE"],
      },
    ],
  },
];

export const getNavigationGroups = (role) =>
  navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

export const canManagePeople = (role) => adminRoles.includes(role);
export const canManageRecords = (role) => managementRoles.includes(role);
