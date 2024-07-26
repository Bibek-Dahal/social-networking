import Joi from 'joi';
import { ErrorApiResponse } from './apiResponse.js';
const showValidationsError = async (req, res, next, schema) => {
  const { error, value } = await schema.validate(req.body, {
    abortEarly: false,
    errors: { label: 'key' },
    wrap: { label: false },
  });
  if (!error) {
    next();
  } else {
    console.log(Joi.any);
    console.log(error.details);
    const err = error.details;

    let validationErrors = [];

    err.forEach((item) => {
      // validationErrors[item.context.key] = item.message;
      validationErrors.push(item.message);
    });
    res.status(400).send(new ErrorApiResponse(validationErrors));
  }
};

export default showValidationsError;
