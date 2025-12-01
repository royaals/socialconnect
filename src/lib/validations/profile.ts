import * as z from 'zod';

export const updateProfileSchema = z.object({
  first_name: z.string().max(50).optional(),
  last_name: z.string().max(50).optional(),
  bio: z.string().max(160, 'Bio must be at most 160 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  privacy: z.enum(['public', 'private', 'followers_only']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;