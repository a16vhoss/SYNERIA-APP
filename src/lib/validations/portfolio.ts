import { z } from "zod";

export const portfolioItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["photo", "video", "document"]),
  project_date: z.string().optional(),
  tags: z.array(z.string()).max(10).default([]),
});

export type PortfolioItemValues = z.infer<typeof portfolioItemSchema>;

export const PORTFOLIO_LIMITS = {
  photo: { maxSize: 10 * 1024 * 1024, maxCount: 20, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
  video: { maxSize: 100 * 1024 * 1024, maxCount: 5, maxDuration: 60, mimeTypes: ["video/mp4", "video/webm"] },
  document: { maxSize: 10 * 1024 * 1024, maxCount: 10, mimeTypes: ["application/pdf"] },
} as const;
