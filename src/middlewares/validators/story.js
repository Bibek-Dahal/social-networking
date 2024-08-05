import Joi from 'joi';
import showValidationsError from '../../utils/display_validation_error.js';
import { storyType } from '../../constants.js';
export class StoryValidator {
  static async createStory(req, res, next) {
    const schema = Joi.object({
      content: Joi.string().trim().max(200),
      contentType: Joi.any().valid(storyType.Image, storyType.Note).required(),
      image: Joi.string(),
    });

    await showValidationsError(req, res, next, schema);
  }
}
