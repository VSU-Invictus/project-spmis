import { z } from 'zod';

// Fields represented in the approved Faculty add/edit modal. Status is not implicitly changed on edit.
export const facultyEditSchema = z.object({
  full_name: z.string().trim().min(1, 'Enter a full name.').max(200, 'Name must be 200 characters or fewer.'),
  email: z.string().trim().email('Enter a valid email address.').max(320, 'Email must be 320 characters or fewer.'),
  department_id: z.string().uuid('Select a department.'),
  role: z.enum(['faculty', 'admin']),
}).strict();

export type FacultyEditValues = z.infer<typeof facultyEditSchema>;
