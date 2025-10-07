import { FastifyInstance } from 'fastify';
import { registerUser, loginUser } from '../controllers/authController';
import { loginUserSchema, registerUserSchema } from '../schemas/authSchema';

// eslint-disable-next-line @typescript-eslint/require-await
export async function authRoutes(server: FastifyInstance) {
  server.post(
    '/register',
    {
      schema: { body: registerUserSchema }
    },
    registerUser
  );
  server.post(
    '/login',
    {
      schema: {
        body: loginUserSchema
      }
    },
    loginUser
  );
}
