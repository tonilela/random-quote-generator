import { FastifyRequest, FastifyReply, DoneFuncWithErrOrRes } from 'fastify';
import { ZodError, ZodObject } from 'zod';

export function ValidateRequest(schemas: {
  body?: ZodObject<any>;
  params?: ZodObject<any>;
  query?: ZodObject<any>;
}) {
  return (request: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes) => {
    try {
      console.log(request.query);
      if (schemas.body) {
        request.body = schemas.body.parse(request.body);
      }
      if (schemas.params) {
        request.params = schemas.params.parse(request.params);
      }
      if (schemas.query) {
        request.query = schemas.query.parse(request.query);
      }
      done();
    } catch (err) {
      if (err instanceof ZodError) {
        console.log(err);
        reply.status(400).send({
          message: 'Validation error',
          errors: err.flatten().fieldErrors,
        });
      } else {
        reply.status(500).send({
          message: 'An unexpected error occured.',
        });
      }
    }
  };
}
