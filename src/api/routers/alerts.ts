import validator from '@api/middlewares/validator';
import AlertService from '@b3_stock_alerts/AlertService';
import PgAlertRepository from '@b3_stock_alerts/PgAlertRepository';
import PgUserRepository from '@b3_stock_alerts/PgUserRepository';
import NotFoundError from '@shared/NotFoundError';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { create_alert } from './validations';

const router = Router();
const alert_service = new AlertService(new PgAlertRepository(), new PgUserRepository());

router.post(
  '/alerts',
  checkSchema(create_alert),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { isMax, user_id, stock, amount } = request.body;

      let result;

      if (isMax) {
        result = await alert_service.createMaxAlert({
          user_id, amount, stock,
        });
      } else {
        result = await alert_service.createMinAlert({
          user_id, amount, stock
        });
      }

      if (result.error instanceof NotFoundError) {
        return response.status(422).json({ message: result.error.message });
      }

      return response.status(201).json(result.data);
    } catch (e) {
      return next(e)
    }
  }
);

router.delete('/alerts/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

export default router;