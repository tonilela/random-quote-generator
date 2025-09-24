import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as quoteService from '../services/quoteService';
import { AuthenticatedUser } from '../server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isQuoteNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message === 'Quote not found';
}

function requireAuth(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) {
    throw new Error('Authentication required');
  }
  return request.user;
}

export async function getRandomQuote(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = request.user || null;
    const quote = await quoteService.getRandomQuote(user);
    return reply.send(quote);
  } catch (error) {
    request.log.error({ err: error }, 'Failed to fetch random quote');
    return reply.status(500).send({ message: getErrorMessage(error) });
  }
}

export async function likeQuote(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id: quoteId } = request.params;
    const user = requireAuth(request);
    const updatedQuote = await quoteService.likeQuote(user.id, Number(quoteId));
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
  request: FastifyRequest<{ Params: { id: string }; Body: { rating: number } }>,
  reply: FastifyReply
) {
  const ratingSchema = z.number().int().min(1).max(5);
  const validationResult = ratingSchema.safeParse(request.body.rating);
  if (!validationResult.success) {
    return reply.status(400).send({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const { id: quoteId } = request.params;
    const user = requireAuth(request);
    const updatedQuote = await quoteService.rateQuote(
      user.id,
      Number(quoteId),
      validationResult.data
    );
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
  request: FastifyRequest<{ Querystring: { q: string } }>,
  reply: FastifyReply
) {
  const { q: searchTerm } = request.query;
  if (!searchTerm || searchTerm.trim().length < 2) {
    return reply.status(400).send({ error: 'Search term must be at least 2 characters long.' });
  }

  try {
    const user = request.user || null;
    const quotes = await quoteService.searchQuotes(searchTerm, user);
    return reply.send(quotes);
  } catch (error) {
    request.log.error({ err: error }, 'Failed to search quotes');
    return reply.status(500).send({ message: getErrorMessage(error) });
  }
}

export async function getLikedQuotes(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = requireAuth(request);
    const quotes = await quoteService.getLikedQuotes(user.id);
    return reply.send(quotes);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return reply.status(401).send({ message: 'Authentication required' });
    }
    request.log.error({ err: error }, 'Failed to fetch liked quotes');
    return reply.status(500).send({ message: getErrorMessage(error) });
  }
}
