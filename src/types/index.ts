import type { UserRole } from "@/generated/prisma/client";

export type Role = UserRole;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
