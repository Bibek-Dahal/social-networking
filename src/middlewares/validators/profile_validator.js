import Joi from "joi";
import showValidationsError from "../../utils/display_validation_error.js";

export class ProfileValidator {
  static async updateProfile(req, res, next) {
    const schema = Joi.object({
      bio: Joi.string().trim().max(200),
      avatar: Joi.string(),
      hobbies: Joi.array().items(Joi.string()),
      phoneNumber: Joi.string().min(10).max(10),
      showPhoneNumber: Joi.boolean(),
    });

    await showValidationsError(req, res, next, schema);
  }
}
