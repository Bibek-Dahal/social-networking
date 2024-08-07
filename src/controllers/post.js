import mongoose from 'mongoose';
import { Post } from '../models/post.js';
import { eventEmitter } from '../utils/eventHandler.js';
import { Schema } from 'mongoose';
import { User } from '../models/user.js';
import { uploadFile } from '../middlewares/firabase-image-upload.js';
import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';

export class PostController {
  static createPost = async (req, res) => {
    try {
      const data = req.body;
      data.user = req.user.id;
      if (req.file) {
        const result = await uploadFile(req.file);
        data.image = result;
        console.log('result==', result);
      }

      const post = await Post.create(data);
      eventEmitter.emit('increasePostCount', req.user);
      return res.status(201).send(
        new SuccessApiResponse({
          message: 'Post created successfully',
          data: post,
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static updatePost = async (req, res) => {
    const { id } = req.params;

    if (req.file) {
      const result = await uploadFile(req.file);
      req.body.image = result;
      console.log('result==', result);
    }
    try {
      console.log(req.body);
      const post = await Post.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Post updated successfully',
          data: post,
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static deletePost = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedPost = await Post.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });
      if (deletedPost) {
        res.status(200).send(
          new SuccessApiResponse({
            message: 'Post deleted successfully',
          })
        );
      } else {
        res.status(403).send(new ErrorApiResponse('Post cant be deleted.'));
      }
      console.log('deleted post==', deletedPost);
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static listAllPosts = async (req, res) => {
    try {
      // Convert to string if needed
      console.log(typeof req.user.id);
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const recentPost = req.query.recentPost == 'true' ? true : false || false;
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)); // Start of the day
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(startOfDay.getDate() + 1);

      const posts = await Post.aggregate([
        {
          $match: recentPost
            ? {
                createdAt: {
                  $gte: startOfDay,
                  $lt: endOfDay,
                },
              }
            : {
                user: userId,
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
            user: { $arrayElemAt: ['$user', 0] },
            isFavourite: {
              $cond: {
                if: { $in: ['$_id', req.user.favouritePost] }, // Check if the post ID is in user's favouritePost array
                then: true,
                else: false,
              },
            }, // Take the first (and only) element from user array
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
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Post fetched successfully',
          data: posts,
        })
      );
    } catch (error) {
      console.log('error', error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static listFavouritePosts = async (req, res) => {
    console.log('list favourite post called', req.user);
    try {
      const posts = await Post.aggregate([
        {
          $match: {
            _id: {
              $in: req.user.favouritePost,
            },
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
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Post fetched successfully',
          data: posts,
        })
      );
    } catch (error) {
      console.log(error);
      return res.status(500).send(new ErrorApiResponse());
    }
  };

  static addFavouritePost = async (req, res) => {
    try {
      console.log('req.params', req.params);
      const post = await Post.findById(req.params.postId);
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const userFavouritePosts = req.user.favouritePost;
      console.log('user-fav', userFavouritePosts);
      if (!post) {
        c;
        return res.status(400).send(new ErrorApiResponse('Post not found'));
      }

      if (
        !userFavouritePosts.includes(new mongoose.Types.ObjectId(`${post.id}`))
      ) {
        console.log('inside if==');
        await req.user.favouritePost.addToSet(post.id);
        req.user.save();
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'post added to favourite post list',
          })
        );
      } else {
        console.log('inside else');
        await User.updateOne(
          { _id: req.user.id },
          { $pull: { favouritePost: post._id } }
        );
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'post removed from favourite post list',
          })
        );
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static listUserPostByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send(new ErrorApiResponse('User not found'));
      }

      const posts = await Post.aggregate([
        {
          $match: {
            user: user._id,
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
      return res.status(200).send(
        new SuccessApiResponse({
          data: posts,
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static getPostById = async (req, res) => {
    const { id } = req.params;
    try {
      const post = await Post.findById(id).populate(
        'user',
        'userName email followers following'
      );
      if (post) {
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Post fetched successfully',
            data: post,
          })
        );
      } else {
        return res.status(404).send(new ErrorApiResponse('Post not found'));
      }
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };
}
