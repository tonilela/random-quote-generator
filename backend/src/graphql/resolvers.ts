import { IResolvers, MercuriusContext } from 'mercurius';
import { FastifyRequest } from 'fastify';
import { z } from 'zod';
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

const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const searchQuotesSchema = z.object({
  term: z.string().min(2, { message: 'Search term must be at least 2 characters.' }),
  page: z.coerce.number().int().positive().optional().default(1),
});

const likeQuoteSchema = z.object({
  quoteId: z.number().int(),
});

const rateQuoteSchema = z.object({
  quoteId: z.number().int(),
  rating: z.number().int().min(1).max(5),
});

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

      // One line to validate and get typed arguments!
      const { term, page } = searchQuotesSchema.parse(args);

      // The service expects an options object for pagination.
      return quoteService.searchQuotes(term, context.user, page);
    },
  },
  Mutation: {
    register: (_parent, args) => {
      const { name, email, password } = registerSchema.parse(args);
      return authService.register(name, email, password);
    },

    login: async (_parent, args, context: AppContext) => {
      const { email, password } = loginSchema.parse(args);
      const user = await authService.login(email, password);

      const payload = { id: user.id, name: user.name, email: user.email };
      const token = context.server.jwt.sign(payload);

      return { token, user: payload };
    },

    likeQuote: (_parent, args, context: AppContext) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');

      const { quoteId } = likeQuoteSchema.parse(args);

      return quoteService.likeQuote(context.user.id, quoteId);
    },

    rateQuote: (_parent, args, context: AppContext) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');

      const { quoteId, rating } = rateQuoteSchema.parse(args);

      return quoteService.rateQuote(context.user.id, quoteId, rating);
    },
  },
};
