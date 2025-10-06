import { z } from 'zod';

export const paramsWithIdSchema = z.object({
  quoteId: z.coerce.number().int().positive(),
});

export type ParamsWithIdType = z.infer<typeof paramsWithIdSchema>;

export const rateQuoteBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export type RateQuoteBodyType = z.infer<typeof rateQuoteBodySchema>;

export const searchQuotesQuerySchema = z.object({
  term: z.string().min(2, { message: 'Search term must be at least 2 characters.' }),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type SearchQuoteType = z.infer<typeof searchQuotesQuerySchema>;

export const likedQuoteQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
});

export type LikedQuoteType = z.infer<typeof likedQuoteQuerySchema>;
