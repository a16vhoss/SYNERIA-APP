import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["sector", "country", "interest"]),
  is_public: z.boolean().default(true),
});

export type CreateGroupValues = z.infer<typeof createGroupSchema>;

export const groupPostSchema = z.object({
  content: z.string().min(1).max(2000),
  media_urls: z.array(z.string()).max(5).default([]),
});

export type GroupPostValues = z.infer<typeof groupPostSchema>;
