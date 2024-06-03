import Joi from "joi";
import showValidationsError from "../../utils/display_validation_error.js";

export class CommentValidator {
  static async createComment(req, res, next) {
    const schema = Joi.object({
      comment: Joi.string().trim().required().max(150),
    });

    await showValidationsError(req, res, next, schema);
  }

  static async updateComment(req, res, next) {
    const schema = Joi.object({
      comment: Joi.string().trim().required().max(150),
    });

    await showValidationsError(req, res, next, schema);
  }
}
