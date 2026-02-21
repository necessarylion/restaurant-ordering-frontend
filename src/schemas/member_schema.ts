import { z } from "zod";
import { Role } from "@/types/models";

export const inviteMemberSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum([Role.ADMIN, Role.STAFF]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([Role.ADMIN, Role.STAFF]),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
