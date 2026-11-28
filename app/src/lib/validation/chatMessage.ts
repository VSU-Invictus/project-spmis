import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, 'Enter a message.').max(2000, 'Message must be 2,000 characters or fewer.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(10_000),
  }).strict()).max(20).optional(),
}).strict();

export type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;
