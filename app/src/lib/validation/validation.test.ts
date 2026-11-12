import { describe, expect, it } from 'vitest';
import { approvalDecisionSchema } from './approvalDecision';
import { chatMessageSchema } from './chatMessage';
import { reviewSchema } from './review';
import { studentSchema } from './student';
import { createTaxonomyProposalEditSchema, taxonomyProposalSchema } from './taxonomyProposal';

const uuid = '45b54332-e470-4c21-a839-7428c4f6bf42';

describe('shared form schemas', () => {
  it('validates review documents and normalizes tags with the domain rules', () => {
    const result = reviewSchema.safeParse({
      student_id: uuid,
      body_document: { blocks: [{ type: 'paragraph', content: [{ text: 'Useful feedback.' }] }] },
      tags: [' Research  mentoring', 'RESEARCH'],
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual(['research', 'mentoring']);
    expect(reviewSchema.safeParse({
      student_id: uuid,
      body_document: { blocks: [{ type: 'paragraph', content: [{ text: '  ' }] }] },
    }).success).toBe(false);
    expect(reviewSchema.safeParse({
      student_id: uuid,
      body_document: { blocks: [{ type: 'paragraph', content: [{ text: Array(501).fill('word').join(' ') }] }] },
    }).success).toBe(false);
  });

  it('validates student fields and trims required text', () => {
    const result = studentSchema.safeParse({
      student_id_number: '  27-1-12345 ',
      first_name: ' Maria ',
      last_name: ' Santos ',
      program_id: uuid,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.first_name).toBe('Maria');
    expect(studentSchema.safeParse({
      student_id_number: ' ', first_name: 'Maria', last_name: 'Santos', program_id: uuid,
    }).success).toBe(false);
  });

  it('validates taxonomy proposals and rejects unchanged edit names', () => {
    const proposal = {
      type: 'department_proposal',
      payload: { name: '  Computer Science  ' },
    } as const;
    const result = taxonomyProposalSchema.safeParse(proposal);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.payload.name).toBe('Computer Science');
    expect(createTaxonomyProposalEditSchema('Computer Science').safeParse(proposal).success).toBe(false);
  });

  it('validates approval and rejection decisions, including department assignment scope', () => {
    expect(approvalDecisionSchema.safeParse({
      decision: 'approve',
      application_ids: [uuid],
      department_assignments: [{ application_id: uuid, department_id: uuid }],
    }).success).toBe(true);
    expect(approvalDecisionSchema.safeParse({
      decision: 'approve',
      application_ids: [uuid],
      department_assignments: [{
        application_id: '8ef76d5f-e6b2-49aa-a627-171dee1b8b65',
        department_id: uuid,
      }],
    }).success).toBe(false);
    expect(approvalDecisionSchema.safeParse({
      decision: 'reject', application_ids: [uuid], reason: '   ',
    }).success).toBe(false);
  });

  it('requires a nonblank chat message within the contract size limit', () => {
    expect(chatMessageSchema.safeParse({ message: '  Find recent reviews ' }).success).toBe(true);
    expect(chatMessageSchema.safeParse({ message: '   ' }).success).toBe(false);
    expect(chatMessageSchema.safeParse({ message: 'x'.repeat(2001) }).success).toBe(false);
  });
});
