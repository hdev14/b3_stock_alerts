import { Schema } from "express-validator";

export const create_user: Schema = {
  name: {
    isString: true
  },
  email: {
    isEmail: true
  },
  phone_number: {
    isString: true,
    isLength: {
      options: { max: 11 }
    }
  },
  password: {
    isString: true,
    isLength: {
      options: { min: 8 },
    },
  },
};