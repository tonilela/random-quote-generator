import { FastifyInstance } from 'fastify';
import { registerUser, loginUser } from '../controllers/authController';

// eslint-disable-next-line @typescript-eslint/require-await
export async function authRoutes(server: FastifyInstance) {
  server.post('/register', registerUser);
  server.post('/login', loginUser);
}
