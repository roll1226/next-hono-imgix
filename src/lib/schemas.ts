import { z } from "zod";

export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
});

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export const ogpParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
});
