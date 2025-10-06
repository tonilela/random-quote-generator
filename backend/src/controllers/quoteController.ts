import { FastifyRequest, FastifyReply } from 'fastify';
import * as quoteService from '../services/quoteService';
import {
  LikedQuoteType,
  ParamsWithIdType,
  RateQuoteBodyType,
  SearchQuoteType,
} from '../schemas/qouteSchema';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isQuoteNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message === 'Quote not found';
}

export async function getRandomQuote(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = request.user;
    const quote = await quoteService.getRandomQuote({ userId: user.id });
    return reply.send(quote);
  } catch (error) {
    request.log.error({ err: error }, 'Failed to fetch random quote');
    return reply.status(500).send({ message: getErrorMessage(error) });
  }
}

export async function likeQuote(
  request: FastifyRequest<{ Params: ParamsWithIdType }>,
  reply: FastifyReply
) {
  try {
    const { quoteId } = request.params;
    const user = request.user;
    const updatedQuote = await quoteService.likeQuote({ userId: user.id, quoteId });
    return reply.send(updatedQuote);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return reply.status(401).send({ message: 'Authentication required' });
    }
    request.log.error({ err: error }, `Failed to like quote`);
    return reply
      .status(isQuoteNotFoundError(error) ? 404 : 500)
      .send({ message: getErrorMessage(error) });
  }
}

export async function rateQuote(
  request: FastifyRequest<{ Params: ParamsWithIdType; Body: RateQuoteBodyType }>,
  reply: FastifyReply
) {
  try {
    const { rating } = request.body;
    const { quoteId } = request.params;
    const user = request.user;
    const updatedQuote = await quoteService.rateQuote({
      userId: user.id,
      quoteId,
      rating,
    });
    return reply.send(updatedQuote);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return reply.status(401).send({ message: 'Authentication required' });
    }
    request.log.error({ err: error }, `Failed to rate quote`);
    return reply
      .status(isQuoteNotFoundError(error) ? 404 : 500)
      .send({ message: getErrorMessage(error) });
  }
}

export async function searchQuotes(
  request: FastifyRequest<{ Querystring: SearchQuoteType }>,
  reply: FastifyReply
) {
  const { term: searchTerm, page } = request.query;
  if (!searchTerm || searchTerm.trim().length < 2) {
    return reply.status(400).send({ error: 'Search term must be at least 2 characters long.' });
  }
  try {
    const user = request.user;
    const quotes = await quoteService.searchQuotes({ searchTerm, userId: user.id, page });
    return reply.send(quotes);
  } catch (error) {
    request.log.error({ err: error }, 'Failed to search quotes');
    return reply.status(500).send({ message: getErrorMessage(error) });
  }
}

export async function getLikedQuotes(
  request: FastifyRequest<{ Querystring: LikedQuoteType }>,
  reply: FastifyReply
) {
  try {
    const { page } = request.query;
    const user = request.user;
    const quotes = await quoteService.getLikedQuotes({ userId: user.id, page });
    return reply.send(quotes);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return reply.status(401).send({ message: 'Authentication required' });
    }
    request.log.error({ err: error }, 'Failed to fetch liked quotes');
    return reply.status(500).send({ message: getErrorMessage(error) });
  }
}
