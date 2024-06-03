import Joi from "joi";
import showValidationsError from "../../utils/display_validation_error.js";

export class AuthValidator {
  static pswdPtrn =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,20}$/;

  static async register(req, res, next) {
    const schema = Joi.object({
      userName: Joi.string().trim().alphanum().min(3).max(50).required(),

      email: Joi.string().trim().email().required(),

      password: Joi.string()
        .trim()
        .pattern(new RegExp(AuthValidator.pswdPtrn))
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

  static login = async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    await showValidationsError(req, res, next, schema);
  };

  static logout = async (req, res, next) => {
    const schema = Joi.object({
      uuid: Joi.string().required(),
    });
    await showValidationsError(req, res, next, schema);
  };

  static refreshToken = async (req, res, next) => {
    const schema = Joi.object({
      refreshToken: Joi.string().required(),
    });
    await showValidationsError(req, res, next, schema);
  };
}
