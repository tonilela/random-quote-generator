import { FastifyInstance } from 'fastify';
import { registerUser, loginUser } from '../controllers/authController';
import { ValidateRequest } from '../middleware/validation';
import { loginUserSchema, registerUserSchema } from '../schemas/authSchema';

// eslint-disable-next-line @typescript-eslint/require-await
export async function authRoutes(server: FastifyInstance) {
  server.post(
    '/register',
    {
      preHandler: [ValidateRequest({ body: registerUserSchema })],
    },
    registerUser
  );
  server.post(
    '/login',
    {
      preHandler: [ValidateRequest({ body: loginUserSchema })],
    },
    loginUser
  );
}
