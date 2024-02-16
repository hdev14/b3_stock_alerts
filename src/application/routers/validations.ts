import { Schema } from 'express-validator';

export const create_user: Schema = {
  name: {
    isString: true,
  },
  email: {
    isEmail: true,
  },
  phone_number: {
    isString: true,
    isLength: {
      options: { max: 11 },
    },
  },
  password: {
    isString: true,
    isLength: {
      options: { min: 8 },
    },
  },
};

export const update_user: Schema = {
  name: {
    optional: true,
    isString: true,
  },
  email: {
    optional: true,
    isEmail: true,
  },
  phone_number: {
    optional: true,
    isString: true,
    isLength: {
      options: { max: 11 },
    },
  },
  password: {
    optional: true,
    isString: true,
    isLength: {
      options: { min: 8 },
    },
  },
};

export const create_alert: Schema = {
  isMax: {
    isBoolean: true,
  },
  user_id: {
    isString: true,
    isUUID: true,
  },
  stock: {
    isString: true,
    isLength: {
      options: { min: 5, max: 6 },
    },
  },
  amount: {
    isFloat: true,
  },
};

export const reset_password: Schema = {
  password: {
    isString: true,
    isLength: {
      options: { min: 8 },
    },
  },
}
