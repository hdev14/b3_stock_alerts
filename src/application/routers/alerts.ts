import NotFoundError from '@shared/NotFoundError';
import {
  NextFunction, Request, Response, Router,
} from 'express';
import { checkSchema, param } from 'express-validator';
import validator from 'src/application/middlewares/validator';
import { alert_service } from '../../bootstrap';
import { create_alert } from './validations';

const router = Router();

router.post(
  '/alerts',
  checkSchema(create_alert),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        isMax, user_id, stock, amount,
      } = request.body;

      const [error, data] = isMax ? await alert_service.createMaxAlert({
        user_id, amount, stock,
      }) : await alert_service.createMinAlert({
        user_id, amount, stock,
      });

      if (error instanceof NotFoundError) {
        return response.status(422).json({ message: error.message });
      }

      return response.status(201).json(data);
    } catch (e) {
      return next(e);
    }
  },
);

router.delete(
  '/alerts/:id',
  param('id').isUUID(),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const [error] = await alert_service.removeAlert(request.params.id);

      if (error instanceof NotFoundError) {
        return response.status(404).json({ message: error.message });
      }

      return response.sendStatus(204);
    } catch (e) {
      return next(e);
    }
  },
);

router.get(
  '/alerts/users/:id',
  param('id').isUUID(),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const [error, data] = await alert_service.listUserAlerts(request.params.id);

      if (error instanceof NotFoundError) {
        return response.status(404).json({ message: error.message });
      }

      return response.status(200).json(data);
    } catch (e) {
      return next(e);
    }
  },
);

export default router;
