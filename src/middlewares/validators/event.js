import Joi from 'joi';
import showValidationsError from '../../utils/display_validation_error.js';
import { EventStatus } from '../../constants.js';

export class EventValidator {
  static async createEvent(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().trim().required().max(100),
      description: Joi.string().trim().max(300),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().required(),
      status: Joi.any().valid(EventStatus.Active, EventStatus.Ongoing),
      timeZone: Joi.string().required(),
      participents: Joi.array().items(Joi.string()),
      location: Joi.string().required().trim(),
      coordinates: Joi.array().length(2).items(Joi.number()),
    });

    await showValidationsError(req, res, next, schema);
  }

  static async updateEvent(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().trim().max(100),
      description: Joi.string().trim().max(300),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
      status: Joi.any().valid(
        EventStatus.Active,
        EventStatus.Ongoing,
        EventStatus.Ended
      ),
      participents: Joi.array().items(Joi.string()),
      location: Joi.string().trim(),
      coordinates: Joi.array().length(2).items(Joi.number()),
    });

    await showValidationsError(req, res, next, schema);
  }
}
