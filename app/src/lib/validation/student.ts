import { z } from 'zod';

const requiredText = (maxLength: number) => z.string()
  .trim()
  .min(1, 'This field is required.')
  .max(maxLength, `Must be ${maxLength} characters or fewer.`);

export const studentSchema = z.object({
  student_id_number: requiredText(50),
  first_name: requiredText(200),
  last_name: requiredText(200),
  middle_name: z.string().trim().nullable().optional(),
  program_id: z.string().uuid(),
}).strict();

export type StudentFormValues = z.infer<typeof studentSchema>;
