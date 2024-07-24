import mongoose from 'mongoose';
import { Post } from '../models/post.js';
import { eventEmitter } from '../utils/eventHandler.js';
import { Schema } from 'mongoose';
export class PostController {
  static createPost = async (req, res) => {
    try {
      const data = req.body;
      data.user = req.user.id;
      if (req.file) {
        data.image = req.file.filename;
      }
      const post = await Post.create(data);
      eventEmitter.emit('increasePostCount', req.user);
      return res.status(201).send({
        message: 'Post created successfully',
        success: true,
        data: post,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: 'Something went wrong',
        success: false,
      });
    }
  };

  static updatePost = async (req, res) => {
    const { id } = req.params;

    if (req.file) {
      req.body.image = req.file.filename;
    }
    try {
      console.log(req.body);
      const post = await Post.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).send({
        message: 'Post updated successfully',
        success: true,
        data: post,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Something went wrong',
        success: false,
      });
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
        res.status(200).send({
          success: true,
          message: 'Post deleted successfully',
        });
      } else {
        res.status(403).send({
          success: false,
          message: 'Post cant be deleted.',
        });
      }
      console.log('deleted post==', deletedPost);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  static listAllPosts = async (req, res) => {
    try {
      // Convert to string if needed
      console.log(typeof req.user.id);
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      // const posts = await Post.find({ user: req.user.id }).populate(
      //   'user',
      //   'userName email followers following'
      // );
      // console.log('posts===', posts);

      const posts = await Post.aggregate([
        {
          $match: {
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
      return res.status(200).send({
        message: 'Post fetched successfully',
        data: posts,
        success: true,
      });
    } catch (error) {
      console.log('error', error);
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
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
        return res.status(200).send({
          success: true,
          message: 'Post fetched successfully',
          data: post,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: 'Post not found',
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: 'Something went wrong',
      });
    }
  };
}
