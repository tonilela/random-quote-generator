import { z } from 'zod';

export const registerGqlSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
export type RegisterGqlType = z.infer<typeof registerGqlSchema>;

export const loginGqlSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginGqlType = z.infer<typeof loginGqlSchema>;

export const searchQuotesGqlSchema = z.object({
  term: z.string().min(2),
  page: z.coerce.number().int().positive().optional().default(1),
});
export type SearchQuotesGqlType = z.infer<typeof searchQuotesGqlSchema>;

export const likeQuoteGqlSchema = z.object({
  quoteId: z.number().int().positive(),
  page: z.coerce.number().int().positive().optional().default(1),
});
export type LikeQuoteGqlType = z.infer<typeof likeQuoteGqlSchema>;

export const likedQuoteGqlSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
});
export type LikedQuoteGqlType = z.infer<typeof likeQuoteGqlSchema>;

export const rateQuoteGqlSchema = z.object({
  quoteId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});
export type RateQuoteGqlType = z.infer<typeof rateQuoteGqlSchema>;
