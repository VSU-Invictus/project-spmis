import { z } from 'zod';
import { validateEntityName, validateEntityNameEdit } from '../rules/entityName';

const entityNameSchema = z.string().transform((name) => name.trim()).superRefine((name, context) => {
  const result = validateEntityName(name);
  if (!result.valid) {
    context.addIssue({
      code: 'custom',
      message: result.reason === 'too_long'
        ? 'Name must be 200 characters or fewer.'
        : 'Enter a name.',
    });
  }
});

export const taxonomyProposalSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('department_proposal'),
    payload: z.object({
      name: entityNameSchema,
      department_id: z.string().uuid().optional(),
    }).strict(),
  }).strict(),
  z.object({
    type: z.literal('program_proposal'),
    payload: z.object({
      name: entityNameSchema,
      program_id: z.string().uuid().optional(),
    }).strict(),
  }).strict(),
]);

export function createTaxonomyProposalEditSchema(currentName: string) {
  return taxonomyProposalSchema.superRefine((proposal, context) => {
    const result = validateEntityNameEdit(proposal.payload.name, currentName);
    if (!result.valid && result.reason === 'unchanged') {
      context.addIssue({
        code: 'custom',
        path: ['payload', 'name'],
        message: 'Enter a name different from the current name.',
      });
    }
  });
}

export type TaxonomyProposalFormValues = z.input<typeof taxonomyProposalSchema>;
export type ValidTaxonomyProposal = z.output<typeof taxonomyProposalSchema>;
