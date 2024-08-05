import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';
import { storyType } from '../constants.js';
import { Story } from '../models/story.js';
export class StoryController {
  static create = async (req, res) => {
    const { contentType } = req.body;
    try {
      if (contentType == storyType.Note) {
        const story = await Story.create({
          content: req.body.content,
          contentType: storyType.Note,
        });
        return res.status(201).send(
          new SuccessApiResponse({
            message: 'Ok',
            data: story,
          })
        );
      } else {
        const result = await uploadFile(req.file);
        const story = await Story.create({
          content: result,
          contentType: storyType.Image,
        });
        return res.status(201).send({
          message: 'Ok',
          data: story,
        });
      }
    } catch (error) {
      return res.status(500).send(new ErrorApiResponse());
    }
  };
}
