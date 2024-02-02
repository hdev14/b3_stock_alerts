import NotFoundError from '@shared/NotFoundError';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema, param } from 'express-validator';
import validator from 'src/application/middlewares/validator';
import { user_service } from '../../bootstrap';
import { create_user, update_user } from './validations';

const router = Router();

router.post(
  '/users',
  checkSchema(create_user),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        name,
        email,
        phone_number,
        password
      } = request.body;

      const result = await user_service.createUser({ name, email, phone_number, password });

      if (result.data) {
        return response.status(201).json(result.data);
      }
    } catch (e) {
      return next(e);
    }
  }
);

router.get(
  '/users/:id',
  param('id').isUUID(),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await user_service.getUser(request.params.id);
      if (result.error instanceof NotFoundError) {
        return response.status(404).json({ message: result.error.message });
      }

      return response.status(200).json(result.data);
    } catch (e) {
      return next(e);
    }
  }
);

router.get('/users', async (_: Request, response: Response, next: NextFunction) => {
  try {
    const result = await user_service.listUsers();

    return response.status(200).json(result.data);
  } catch (e) {
    return next(e);
  }
});

router.put(
  '/users/:id',
  param('id').isUUID(),
  checkSchema(update_user),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        name,
        email,
        phone_number,
        password,
      } = request.body;

      const result = await user_service.updateUser({
        user_id: request.params.id,
        name,
        email,
        phone_number,
        password
      });

      if (result.error instanceof NotFoundError) {
        return response.status(404).json({ message: result.error.message });
      }

      return response.status(200).json(result.data);
    } catch (e) {
      return next(e);
    }
  }
);

router.delete(
  '/users/:id',
  param('id').isUUID(),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await user_service.removeUser(request.params.id);

      if (result && result.error instanceof NotFoundError) {
        return response.status(404).json({ message: result.error.message });
      }

      return response.sendStatus(204);
    } catch (e) {
      return next(e);
    }
  }
);

export default router;