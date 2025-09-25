import { FastifyInstance } from 'fastify';

import {
  getRandomQuote,
  likeQuote,
  rateQuote,
  getLikedQuotes,
  searchQuotes,
} from '../controllers/quoteController';

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
    '/quotes/:id/like',
    {
      preHandler: [server.authenticate as any],
    },
    likeQuote
  );

  server.post(
    '/quotes/:id/rate',
    {
      preHandler: [server.authenticate as any],
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
      preHandler: [server.authenticate as any],
    },
    searchQuotes
  );
}
