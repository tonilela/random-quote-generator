import 'reflect-metadata';
import fastify, { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt, { JWT } from '@fastify/jwt';
import mercurius from 'mercurius';
import { config } from './config/config.js';
import { connectToDatabase } from './database/sequelize.js';
import { quoteRoutes } from './routes/quotes.js';
import { authRoutes } from './routes/auth.js';
import { schema } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { User } from './models/user.js';
import { Quote } from './models/quote.js';
import { QuoteLike } from './models/quoteLike.js';
import { QuoteRating } from './models/quoteRating.js';

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
});

async function buildServer() {
  server.get('/health', async (request, reply) => {
    return reply.status(200).send({ status: 'ok' });
  });

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
    resolvers: resolvers as any,
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
    
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = '0.0.0.0';
    
    await app.listen({ port, host });

    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📖 GraphiQL IDE available at http://${host}:${port}/graphiql`);
    console.log(`🎯 Heroku should be able to reach this on port ${port}`);
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