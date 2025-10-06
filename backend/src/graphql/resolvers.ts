import { IResolvers, MercuriusContext } from 'mercurius';
import { FastifyRequest } from 'fastify';
import * as authService from '../services/authService';
import * as quoteService from '../services/quoteService';
import { protectedResolver, validatedResolver } from './resolverMiddleware';
import {
  registerGqlSchema,
  loginGqlSchema,
  searchQuotesGqlSchema,
  likeQuoteGqlSchema,
  rateQuoteGqlSchema,
  LoginGqlType,
  LikeQuoteGqlType,
  RateQuoteGqlType,
  SearchQuotesGqlType,
  RegisterGqlType,
  likedQuoteGqlSchema,
  LikedQuoteGqlType,
} from './validation';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  iat: number;
}

interface AppContext extends MercuriusContext {
  server: FastifyRequest['server'];
  user: AuthenticatedUser | null;
}

export const resolvers: IResolvers<unknown, AppContext> = {
  Query: {
    randomQuote: protectedResolver((_parent, _args, context) => {
      if (!context.user) throw new Error('Authentication required. Please provide a valid token.');
      return quoteService.getRandomQuote({ userId: context.user.id });
    }),

    likedQuotes: protectedResolver(
      validatedResolver(likedQuoteGqlSchema, (_parent, args, context) => {
        if (!context.user)
          throw new Error('Authentication required. Please provide a valid token.');

        const { page } = args as LikedQuoteGqlType;

        return quoteService.getLikedQuotes({ userId: context.user.id, page });
      })
    ),

    searchQuotes: protectedResolver(
      validatedResolver(searchQuotesGqlSchema, (_parent, args, context) => {
        if (!context.user)
          throw new Error('Authentication required. Please provide a valid token.');

        const { term, page } = args as SearchQuotesGqlType;
        console.log(page);
        return quoteService.searchQuotes({ searchTerm: term, userId: context.user.id, page });
      })
    ),
  },
  Mutation: {
    register: validatedResolver(registerGqlSchema, (_parent, args) => {
      const { name, email, password } = args as RegisterGqlType;
      return authService.register(name, email, password);
    }),

    login: validatedResolver(loginGqlSchema, async (_parent, args, context) => {
      const { email, password } = args as LoginGqlType;
      const user = await authService.login(email, password);

      const payload = { id: user.id, name: user.name, email: user.email };
      const token = context.server.jwt.sign(payload);

      return { token, user: payload };
    }),

    likeQuote: protectedResolver(
      validatedResolver(likeQuoteGqlSchema, (_parent, args, context) => {
        if (!context.user)
          throw new Error('Authentication required. Please provide a valid token.');

        const { quoteId } = args as LikeQuoteGqlType;

        return quoteService.likeQuote({ userId: context.user.id, quoteId });
      })
    ),

    rateQuote: protectedResolver(
      validatedResolver(rateQuoteGqlSchema, (_parent, args, context) => {
        if (!context.user)
          throw new Error('Authentication required. Please provide a valid token.');

        const { quoteId, rating } = args as RateQuoteGqlType;

        return quoteService.rateQuote({ userId: context.user.id, quoteId, rating });
      })
    ),
  },
};
