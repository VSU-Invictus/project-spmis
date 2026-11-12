import { z } from 'zod';

const applicationIdsSchema = z.array(z.string().uuid())
  .min(1, 'Select at least one application.')
  .max(100, 'You can decide up to 100 applications at a time.')
  .refine((ids) => new Set(ids).size === ids.length, 'Application IDs must be unique.');

const approveSchema = z.object({
  application_ids: applicationIdsSchema,
  decision: z.literal('approve'),
  department_assignments: z.array(z.object({
    application_id: z.string().uuid(),
    department_id: z.string().uuid(),
  }).strict()).max(100).optional(),
}).strict().superRefine((decision, context) => {
  const assignedApplicationIds = decision.department_assignments?.map(({ application_id }) => application_id) ?? [];
  if (new Set(assignedApplicationIds).size !== assignedApplicationIds.length) {
    context.addIssue({
      code: 'custom',
      path: ['department_assignments'],
      message: 'Each application can have only one department assignment.',
    });
  }
  if (assignedApplicationIds.some((id) => !decision.application_ids.includes(id))) {
    context.addIssue({
      code: 'custom',
      path: ['department_assignments'],
      message: 'Department assignments must refer to a selected application.',
    });
  }
});

const rejectSchema = z.object({
  application_ids: applicationIdsSchema,
  decision: z.literal('reject'),
  reason: z.string().trim().min(1, 'Enter a rejection reason.').max(1000, 'Reason must be 1,000 characters or fewer.'),
}).strict();

export const approvalDecisionSchema = z.discriminatedUnion('decision', [approveSchema, rejectSchema]);

export type ApprovalDecisionFormValues = z.input<typeof approvalDecisionSchema>;
export type ValidApprovalDecision = z.output<typeof approvalDecisionSchema>;
