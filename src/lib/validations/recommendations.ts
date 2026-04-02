import { z } from "zod";

export const recommendationSchema = z.object({
  recipient_id: z.string().uuid(),
  relationship: z.enum(["coworker", "same_project", "same_sector", "acquaintance"]),
  content: z.string().min(20).max(500),
  highlighted_skills: z.array(z.string()).max(5).default([]),
});

export type RecommendationValues = z.infer<typeof recommendationSchema>;
