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
  server.get('/quotes/random', { preHandler: [server.authenticate] }, getRandomQuote);
  server.post('/quotes/:id/like', { preHandler: [server.authenticate] }, likeQuote);
  server.post('/quotes/:id/rate', { preHandler: [server.authenticate] }, rateQuote);
  server.get('/quotes/liked', { preHandler: [server.authenticate] }, getLikedQuotes);
  server.get('/quotes/search', { preHandler: [server.authenticate] }, searchQuotes);
}
