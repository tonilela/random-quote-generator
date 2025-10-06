import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as authService from '../services/authService';
import { LoginUserBodyType, RegisterUserBodyType } from '../schemas/authSchema';

export async function registerUser(
  request: FastifyRequest<{
    Body: RegisterUserBodyType;
  }>,
  reply: FastifyReply
) {
  try {
    const { name, email, password } = request.body;
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

export async function loginUser(
  request: FastifyRequest<{
    Body: LoginUserBodyType;
  }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;
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
