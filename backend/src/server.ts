import 'reflect-metadata';
import fastify, { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt, { JWT } from '@fastify/jwt';
import mercurius from 'mercurius';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { config } from './config/config';
import { connectToDatabase } from './database/sequelize';

import { quoteRoutes } from './routes/quotes';
import { authRoutes } from './routes/auth';

import { schema } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

import { User } from './models/user';
import { Quote } from './models/quote';
import { QuoteLike } from './models/quoteLike';
import { QuoteRating } from './models/quoteRating';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  iat: number;
}

interface AppContext {
  server: FastifyInstance;
  user: AuthenticatedUser | null;
}

declare module 'fastify' {
  export interface FastifyInstance {
    db: {
      User: typeof User;
      Quote: typeof Quote;
      QuoteLike: typeof QuoteLike;
      QuoteRating: typeof QuoteRating;
    };
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    jwt: JWT;
  }
}

const server = fastify({
  logger: process.env.NODE_ENV === 'development' ? { level: 'info' } : { level: 'warn' },
}).withTypeProvider<ZodTypeProvider>();

async function buildServer() {
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  await server.register(cors, { origin: true, credentials: true });
  await server.register(jwt, { secret: config.JWT_SECRET });

  server.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  server.decorate('db', { User, Quote, QuoteLike, QuoteRating });

  await server.register(mercurius, {
    schema,
    resolvers: resolvers as any, // Temporarily bypass type checking for resolvers
    context: async (request: FastifyRequest): Promise<AppContext> => {
      let user: AuthenticatedUser | null = null;
      try {
        await request.jwtVerify();
        user = (request.user as AuthenticatedUser) || null;
      } catch {
        // If it fails (no token, invalid token), user remains null
      }
      return { server: request.server, user };
    },
    graphiql: true,
  });

  await server.register(quoteRoutes, { prefix: '/api' });
  await server.register(authRoutes, { prefix: '/api/auth' });

  return server;
}

async function start() {
  try {
    await connectToDatabase();
    const app = await buildServer();
    const port = config.PORT || 3000;

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📖 GraphiQL IDE available at http://localhost:${port}/graphiql`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  void start();
}

export { buildServer };
export type { AuthenticatedUser, AppContext };
