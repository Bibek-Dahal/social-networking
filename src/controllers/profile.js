import { Profile } from '../models/profile.js';
import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';
import { Post } from '../models/post.js';
import mongoose from 'mongoose';
import { User } from '../models/user.js';
export class ProfileController {
  static updateProfle = async (req, res) => {
    try {
      console.log(req.body);

      if (req.file) {
        req.body.avatar = req.file.filename;
      }
      if (req.body.phoneNumber) {
        const userWithPhnExists = await Profile.findOne({
          $and: [
            { user: { $ne: req.user.id } },
            { phoneNumber: req.body.phoneNumber },
          ],
        });
        if (userWithPhnExists) {
          return res
            .status(400)
            .send(
              new ErrorApiResponse('User with phone number already exists')
            );
        }
      }

      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: req.body },
        // req.body,
        { new: true }
      );
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Profile updated successfully',

          data: profile,
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static getProfile = async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Profile fetched successfully',
            data: profile,
          })
        );
      } else {
        return res.status(404).send(new ErrorApiResponse('Profile not found'));
      }
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static getProfileById = async (req, res) => {
    console.log(req.params);
    const { userId } = req.params;
    console.log('profiled===', userId);
    const mongooseUserId = new mongoose.Types.ObjectId(`${userId}`);
    try {
      const profile = await Profile.findOne({ user: userId }).populate({
        path: 'user',
        select: { password: 0, googleAuthSecret: 0 },
      });

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send(new ErrorApiResponse('Profile not found'));
      }

      if (!profile) {
        return res.status(404).send(new ErrorApiResponse('Profile not found'));
      }

      const posts = await Post.aggregate([
        {
          $match: {
            user: mongooseUserId,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] }, // Take the first (and only) element from user array
            isFavourite: {
              $cond: {
                if: { $in: ['$_id', req.user.favouritePost] }, // Check if the post ID is in user's favouritePost array
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'likes',
            let: { postId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post', '$$postId'] }, // Match likes for the current post
                      { $eq: ['$user', req.user._id] }, // Match likes by the current user
                    ],
                  },
                },
              },
            ],
            as: 'likes',
          },
        },
        {
          $addFields: {
            likedByCurrentUser: { $gt: [{ $size: '$likes' }, 0] }, // Check if there are any likes (user has liked)
          },
        },
        {
          $project: {
            'user.password': 0,
            likes: 0, // Exclude likes array from the final output if not needed
            // Add other fields to project if needed
          },
        },
      ]);

      const resData = {
        profile: profile,
        user: user,
        posts: posts,
      };

      return res.status(200).send(
        new SuccessApiResponse({
          data: resData,
          message: 'Profile fetched.',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };
}
