import { IFieldResolver } from 'mercurius';
import { ZodError, AnyZodObject } from 'zod';
import { AppContext } from '../server';

type Resolver = IFieldResolver<unknown, AppContext>;

export function validatedResolver(schema: AnyZodObject, next: Resolver): Resolver {
  return (parent, args, context, info) => {
    try {
      const validatedArgs = schema.parse(args);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return next(parent, validatedArgs, context, info);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]?.message || 'Invalid input';
        throw new Error(`Validation Error: ${firstError}`);
      }
      throw error;
    }
  };
}

export function protectedResolver(next: Resolver): Resolver {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new Error('Authentication required.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next(parent, args, context, info);
  };
}
