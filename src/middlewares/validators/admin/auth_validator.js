import Joi from "joi";
import showValidationsError from "../../../utils/display_validation_error.js";
import { userRoles } from "../../../constants.js";

export class AdminUserValidator {
  static pswdPtrn =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,20}$/;

  static async createUser(req, res, next) {
    const schema = Joi.object({
      userName: Joi.string().trim().alphanum().min(3).max(50).required(),
      email: Joi.string().trim().email().required(),
      role: Joi.any().valid(userRoles.User, userRoles.Admin),
      followers: Joi.array(),
      following: Joi.array(),
      password: Joi.string()
        .trim()
        .pattern(new RegExp(AdminUserValidator.pswdPtrn))
        .required()
        .messages({
          "string.pattern.base":
            "Password must contain atleast one digit one special character and one upper case letter",
        }),

      repeat_password: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "password and repeat password do not match",
          "any.required": "{{#label}} is required",
        }),
    });

    await showValidationsError(req, res, next, schema);
  }

  static updateUser = async (req, res, next) => {
    const schema = Joi.object({
      userName: Joi.string().trim().alphanum().min(3).max(50).required(),
      email: Joi.string().trim().email().required(),
      role: Joi.any().valid(userRoles.User, userRoles.Admin).required(),
      blockUser: Joi.boolean().required(),
      followers: Joi.array().required(),
      following: Joi.array().required(),
    });

    await showValidationsError(req, res, next, schema);
  };
}
