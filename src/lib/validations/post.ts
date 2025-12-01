import * as z from 'zod';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(280, 'Post must be at most 280 characters'),
  category: z.enum(['general', 'announcement', 'question']).default('general'),
  image: z.instanceof(File).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;