import type {
  AssessmentAuditAction,
  Prisma,
  PrismaClient,
} from "@prisma/client";

type AuditClient =
  | PrismaClient
  | Prisma.TransactionClient;

type CreateAssessmentAuditInput = {
  action: AssessmentAuditAction;

  actorId?: string | null;
  actorRole?: string | null;

  assessmentId?: number | null;
  attemptId?: number | null;
  studentId?: string | null;

  metadata?: Prisma.InputJsonValue;

  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAssessmentAudit(
  client: AuditClient,
  input: CreateAssessmentAuditInput
) {
  return client.assessmentAuditLog.create({
    data: {
      action: input.action,

      actorId: input.actorId ?? null,
      actorRole:
        input.actorRole ?? null,

      assessmentId:
        input.assessmentId ?? null,

      attemptId:
        input.attemptId ?? null,

      studentId:
        input.studentId ?? null,

      metadata:
        input.metadata,

      ipAddress:
        input.ipAddress ?? null,

      userAgent:
        input.userAgent ?? null,
    },
  });
}