import { db } from "../../db/index";
import { adminActions } from "../../db/schema";

type AuditLogInput = {
  adminUserId: number;
  action: string;
  targetType: string;
  targetId?: number;
  targetLabel?: string;
  details?: Record<string, unknown>;
};

export async function createAuditLog(input: AuditLogInput) {
  await db.insert(adminActions).values({
    adminUserId: input.adminUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    targetLabel: input.targetLabel ?? null,
    details: input.details ?? null,
  });
}