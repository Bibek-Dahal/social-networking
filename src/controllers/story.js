import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';
import { storyType } from '../constants.js';
import { Story } from '../models/story.js';
import { uploadFile } from '../middlewares/firabase-image-upload.js';
export class StoryController {
  static create = async (req, res) => {
    const { contentType } = req.body;
    try {
      if (contentType == storyType.Note) {
        if (!req.body.content) {
          return res
            .status(400)
            .send(
              new ErrorApiResponse('content field is required is required')
            );
        }
        const story = await Story.create({
          user: req.user.id,
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
        if (!req.file) {
          return res
            .status(400)
            .send(new ErrorApiResponse('image field is required'));
        }
        const result = await uploadFile(req.file);
        const story = await Story.create({
          user: req.user.id,
          content: result,
          contentType: storyType.Image,
        });
        return res.status(201).send({
          message: 'Ok',
          data: story,
        });
      }
    } catch (error) {
      console.log('error', error);
      return res.status(500).send(new ErrorApiResponse());
    }
  };

  static getStory = async (req, res) => {
    try {
      const { storyId } = req.params;
      const story = await Story.findById(storyId);
      if (!story) {
        return res.status(404).send(new ErrorApiResponse('Story not found'));
      }

      const updatedStory =
        req.user.id != story.user
          ? await Story.findByIdAndUpdate(
              story.id,

              {
                $addToSet: {
                  viewers: req.user._id,
                },
              },
              {
                new: true,
              }
            )
          : story;

      const populated = await updatedStory.populate({
        path: 'viewers user reply.user',
        select: {
          userName: 1,
          avatar: 1,
        },
      });

      console.log('updated-story===', populated);

      return res.status(200).send(
        new SuccessApiResponse({
          data: {
            story: updatedStory,
            viewersCount: updatedStory.viewers.length,
            replyCount: updatedStory.reply.length,
          },
        })
      );
    } catch (error) {
      console.log(error);
      return res.status(500).send(new ErrorApiResponse());
    }
  };

  static listViewers = async (req, res) => {
    try {
      const { storyId } = req.params;
      const story = await Story.findById(storyId).populate({
        path: 'viewers',
        select: {
          userName: 1,
          avatar: 1,
        },
      });
      if (!story) {
        return res.status(404).send(new ErrorApiResponse('Story not found'));
      }
      return res.status(200).send(
        new SuccessApiResponse({
          data: {
            viewers: story.viewers,
          },
        })
      );
    } catch (error) {
      return res.status(500).send(new ErrorApiResponse());
    }
  };

  static addReply = async (req, res) => {
    console.log('add reply called');
    try {
      const { storyId } = req.params;
      const { content } = req.body;
      const story = await Story.findById(storyId);
      if (!story) {
        return res.status(404).send(new ErrorApiResponse('Story not found'));
      }

      const updatedStory = await Story.findByIdAndUpdate(
        story.id,
        {
          $push: {
            reply: {
              user: req.user.id,
              content: content,
            },
          },
        },
        {
          new: true,
        }
      );
      return res.status(200).send(
        new SuccessApiResponse({
          data: updatedStory,
        })
      );
    } catch (error) {
      return res.status(500).send(new ErrorApiResponse());
    }
  };

  static deleteStory = async (req, res) => {
    try {
      const { storyId } = req.params;
      const { content } = req.body;
      const story = await Story.findOne({ _id: storyId, user: req.user.id });
      if (!story) {
        return res.status(404).send(new ErrorApiResponse('Story not found'));
      }
      const result = await Story.deleteOne({
        _id: story.id,
      });
      if (result.deletedCount == 1) {
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Story deleted',
          })
        );
      } else {
        return res.status(400).send(new ErrorApiResponse('Story deleted'));
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(new ErrorApiResponse());
    }
  };
}
