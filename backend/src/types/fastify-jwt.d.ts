import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; name: string; email: string };
    user: {
      id: string;
      name: string;
      email: string;
      iat: number;
    };
  }
}
