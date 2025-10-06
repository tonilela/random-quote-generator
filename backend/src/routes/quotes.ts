import { FastifyInstance } from 'fastify';

import {
  getRandomQuote,
  likeQuote,
  rateQuote,
  getLikedQuotes,
  searchQuotes,
} from '../controllers/quoteController';
import { ValidateRequest } from '../middleware/validation';
import {
  paramsWithIdSchema,
  rateQuoteBodySchema,
  searchQuotesQuerySchema,
} from '../schemas/qouteSchema';

// eslint-disable-next-line @typescript-eslint/require-await
export async function quoteRoutes(server: FastifyInstance) {
  // Use type assertions to avoid websocket type conflicts
  server.get(
    '/quotes/random',
    {
      preHandler: [server.authenticate as any],
    },
    getRandomQuote
  );

  server.post(
    '/quotes/:quoteId/like',
    {
      preHandler: [server.authenticate as any, ValidateRequest({ params: paramsWithIdSchema })],
    },
    likeQuote
  );

  server.post(
    '/quotes/:quoteId/rate',
    {
      preHandler: [
        server.authenticate as any,
        ValidateRequest({ params: paramsWithIdSchema, body: rateQuoteBodySchema }),
      ],
    },
    rateQuote
  );

  server.get(
    '/quotes/liked',
    {
      preHandler: [server.authenticate as any],
    },
    getLikedQuotes
  );

  server.get(
    '/quotes/search',
    {
      preHandler: [server.authenticate as any, ValidateRequest({ query: searchQuotesQuerySchema })],
    },
    searchQuotes
  );
}
