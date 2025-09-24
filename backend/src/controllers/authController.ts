import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as authService from '../services/authService';

const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function registerUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, email, password } = registerUserSchema.parse(request.body);
    const newUser = await authService.register(name, email, password);
    return reply.status(201).send(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: 'Invalid input', errors: error.errors });
    }
    request.log.error({ err: error }, 'User registration failed');
    return reply.status(409).send({ message: (error as Error).message });
  }
}

export async function loginUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = loginUserSchema.parse(request.body);
    const user = await authService.login(email, password);

    const payload = { id: user.id, name: user.name, email: user.email };
    const token = request.server.jwt.sign(payload);

    return reply.send({ token, user: payload });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: 'Invalid input', errors: error.errors });
    }
    request.log.error({ err: error }, 'User login failed');
    return reply.status(401).send({ message: (error as Error).message });
  }
}
