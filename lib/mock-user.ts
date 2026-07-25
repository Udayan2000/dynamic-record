import type { User } from "@/types";

/**
 * Demo accounts for local development, wired to the mock API routes
 * under app/api/auth/*. Replace these routes with real calls to your
 * backend once it's ready — nothing else in the app needs to change,
 * since components only ever talk to `services/auth-service.ts`.
 */
export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "u_admin_1",
    name: "Asha Admin",
    email: "admin@company.com",
    password: "password123",
    role: "admin",
    department: "Operations",
    createdAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "u_employee_1",
    name: "Ethan Employee",
    email: "employee@company.com",
    password: "password123",
    role: "employee",
    department: "Sales",
    createdAt: "2024-03-02T00:00:00.000Z",
  },
];
