import Joi from 'joi';
import showValidationsError from '../../utils/display_validation_error.js';

export class TestValidator {
  static async createTest(req, res, next) {
    const schema = Joi.object({
      _id: Joi.any(),
      firstName: Joi.string().trim().max(20),
      lastName: Joi.string().trim().max(20),
      email: Joi.string().trim().max(200),
      address: Joi.string().trim().max(60),
      ratePerHour: Joi.number(),
      hours: Joi.number(),
      total: Joi.number(),
    });

    await showValidationsError(req, res, next, schema);
  }

  static async updateTest(req, res, next) {
    const schema = Joi.object({
      firstName: Joi.string().trim().max(20),
      lastName: Joi.string().trim().max(20),
      email: Joi.string().trim().max(200),
      address: Joi.string().trim().max(60),
      ratePerHour: Joi.number(),
      hours: Joi.number(),
      total: Joi.number(),
    });

    await showValidationsError(req, res, next, schema);
  }
}
