import { IResolvers } from 'mercurius';
import * as authService from '../services/authService.js';
import * as quoteService from '../services/quoteService.js';
import {
  registerGqlSchema,
  loginGqlSchema,
  searchQuotesGqlSchema,
  likeQuoteGqlSchema,
  rateQuoteGqlSchema,
  likedQuoteGqlSchema,
} from './validation.js';
import type { AppContext } from '../server.js';

export const resolvers: IResolvers<unknown, AppContext> = {
  Query: {
    randomQuote: async (_parent, _args, context) => {
      if (!context.user) {
        throw new Error('Authentication required.');
      }
      return quoteService.getRandomQuote({ userId: context.user.id });
    },

    likedQuotes: async (_parent, args, context) => {
      if (!context.user) {
        throw new Error('Authentication required.');
      }
      const validatedArgs = likedQuoteGqlSchema.parse(args);
      const { page } = validatedArgs;
      return quoteService.getLikedQuotes({ userId: context.user.id, page });
    },

    searchQuotes: async (_parent, args, context) => {
      if (!context.user) {
        throw new Error('Authentication required.');
      }
      const validatedArgs = searchQuotesGqlSchema.parse(args);
      const { term, page } = validatedArgs;
      return quoteService.searchQuotes({ searchTerm: term, userId: context.user.id, page });
    },
  },

  Mutation: {
    register: async (_parent, args) => {
      const validatedArgs = registerGqlSchema.parse(args);
      const { name, email, password } = validatedArgs;
      return authService.register(name, email, password);
    },

    login: async (_parent, args, context) => {
      const validatedArgs = loginGqlSchema.parse(args);
      const { email, password } = validatedArgs;
      const user = await authService.login(email, password);

      const payload = { id: user.id, name: user.name, email: user.email };
      const token = context.server.jwt.sign(payload);

      return { token, user: payload };
    },

    likeQuote: async (_parent, args, context) => {
      if (!context.user) {
        throw new Error('Authentication required.');
      }
      const validatedArgs = likeQuoteGqlSchema.parse(args);
      const { quoteId } = validatedArgs;
      return quoteService.likeQuote({ userId: context.user.id, quoteId });
    },

    rateQuote: async (_parent, args, context) => {
      if (!context.user) {
        throw new Error('Authentication required.');
      }
      const validatedArgs = rateQuoteGqlSchema.parse(args);
      const { quoteId, rating } = validatedArgs;
      return quoteService.rateQuote({ userId: context.user.id, quoteId, rating });
    },
  },
};