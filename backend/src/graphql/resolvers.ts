import { IResolvers, MercuriusContext } from 'mercurius';
import { FastifyRequest } from 'fastify';
import * as authService from '../services/authService';
import * as quoteService from '../services/quoteService';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

interface AppContext extends MercuriusContext {
  server: FastifyRequest['server'];
  user: AuthenticatedUser | null;
}

interface RegisterArgs {
  name: string;
  email: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface SearchQuotesArgs {
  term: string;
}

interface LikeQuoteArgs {
  quoteId: number;
}

interface RateQuoteArgs {
  quoteId: number;
  rating: number;
}

function validateRegisterArgs(args: unknown): RegisterArgs {
  const { name, email, password } = args as RegisterArgs;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid arguments: name, email, and password must be strings');
  }
  return { name, email, password };
}

function validateLoginArgs(args: unknown): LoginArgs {
  const { email, password } = args as LoginArgs;
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid arguments: email and password must be strings');
  }
  return { email, password };
}

function validateSearchQuotesArgs(args: unknown): SearchQuotesArgs {
  const { term } = args as SearchQuotesArgs;
  if (typeof term !== 'string') {
    throw new Error('Invalid arguments: term must be a string');
  }
  return { term };
}

function validateLikeQuoteArgs(args: unknown): LikeQuoteArgs {
  const { quoteId } = args as LikeQuoteArgs;
  if (typeof quoteId !== 'number' || !Number.isInteger(quoteId)) {
    throw new Error('Invalid arguments: quoteId must be an integer');
  }
  return { quoteId };
}

function validateRateQuoteArgs(args: unknown): RateQuoteArgs {
  const { quoteId, rating } = args as RateQuoteArgs;
  if (typeof quoteId !== 'number' || !Number.isInteger(quoteId)) {
    throw new Error('Invalid arguments: quoteId must be an integer');
  }
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Invalid arguments: rating must be an integer between 1 and 5');
  }
  return { quoteId, rating };
}

export const resolvers: IResolvers<unknown, AppContext> = {
  Query: {
    randomQuote: (_parent, _args, context: AppContext) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');
      return quoteService.getRandomQuote(context.user);
    },
    likedQuotes: (_parent, _args, context: AppContext) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');
      return quoteService.getLikedQuotes(context.user.id);
    },
    searchQuotes: (_parent, args, context: AppContext) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');
      const { term } = validateSearchQuotesArgs(args);
      return quoteService.searchQuotes(term, context.user);
    },
  },
  Mutation: {
    register: (_parent, args) => {
      const { name, email, password } = validateRegisterArgs(args);
      return authService.register(name, email, password);
    },
    login: async (_parent, args, context: AppContext) => {
      const { email, password } = validateLoginArgs(args);
      const user = await authService.login(email, password);
      const payload = { id: user.id, name: user.name, email: user.email };
      const token = context.server.jwt.sign(payload);
      return { token, user: payload };
    },
    likeQuote: (_parent, args, context: AppContext) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');
      const { quoteId } = validateLikeQuoteArgs(args);
      return quoteService.likeQuote(context.user.id, quoteId);
    },
    rateQuote: (_parent, args, context: AppContext) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');
      const { quoteId, rating } = validateRateQuoteArgs(args);
      return quoteService.rateQuote(context.user.id, quoteId, rating);
    },
  },
};
