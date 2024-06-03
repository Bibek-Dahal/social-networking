import Joi from "joi";
import showValidationsError from "../../utils/display_validation_error.js";

export class PostValidator {
  static async createPost(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().trim().required().max(100),
      description: Joi.string().required().trim().max(300),
    });

    await showValidationsError(req, res, next, schema);
  }

  static async updatePost(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().trim().max(100),
      description: Joi.string().trim().max(300),
    });

    await showValidationsError(req, res, next, schema);
  }
}
