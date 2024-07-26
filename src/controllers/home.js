import { Post } from '../models/post.js';
import { Subscription } from '../models/subscription.js';
import mongoose from 'mongoose';
import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';
export class HomeController {
  static homeFeed = async (req, res) => {
    try {
      const userFollowings = req.user.following;
      console.log(userFollowings);

      //finds whom current user have subscribed to
      const subscribedUsers = await Subscription.find({
        subscribeFrom: req.user.id,
      });

      //filters if subscribed user is in following list of user
      const userFollowingFilter = subscribedUsers.filter((item) => {
        return !item.isExpired && userFollowings.includes(item.subscribeTo);
      });
      console.log('userFollowingFilter==', userFollowingFilter);
      // console.log("subscribed user====", subscribedUsers);

      const lookupPosts = await Post.aggregate([
        {
          $match: {
            user: { $in: userFollowings },
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

      // console.log('lookupPosts====', lookupPosts);
      // const posts = await Post.find({ user: { $in: userFollowingFilter } })
      //   .populate(
      //     {
      //       path: 'user',
      //       select: 'userName email profile',
      //       populate: { path: 'profile', select: 'avatar bio ' },
      //     }
      //     // "user",
      //     // "userName email profile"
      //   )
      //   .limit(2);
      // .populate({
      //   path: "comments",
      //   select: "user",
      //   populate: { path: "user", select: "email userName" },
      // });
      return res.status(200).send(
        new SuccessApiResponse({
          data: lookupPosts,
          message: 'Post fetched successfully',
        })
      );
    } catch (error) {
      console.log(error);
      return res.status(500).send(new ErrorApiResponse());
    }
  };
}
