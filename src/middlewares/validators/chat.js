import Joi from 'joi';
import showValidationsError from '../../utils/display_validation_error.js';

export class ChatValidator {
  static async createChat(req, res, next) {
    const schema = Joi.object({
      message: Joi.string().trim().required().max(200),
    });

    await showValidationsError(req, res, next, schema);
  }
}
