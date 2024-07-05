import { Post } from '../../models/post.js';
import { UserRepository } from './userRepository.js';
import { GraphQLError } from 'graphql';

export class PostRepository {
  static createPost = async (postInput, userId) => {
    const { title, description } = postInput;
    try {
      const post = await Post.create({
        title,
        description,
        user: userId,
      });
      return post;
    } catch (error) {
      throw new GraphQLError('Post couldnot be created', {
        extensions: {
          code: 'SERVER_ERROR',
          http: { status: 500 },
        },
      });
    }
  };

  static listUserPost = async (userId) => {
    console.log('userId=====', userId);
    const posts = await Post.find({ user: userId }).populate('user');

    return posts;
  };

  static getPostById = async (postId) => {
    try {
      const post = await Post.findById(postId).populate('user');
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: {
            code: 'NOT_FOUND',
            http: { status: 404 },
          },
        });
      }
      return post;
    } catch (error) {
      throw new GraphQLError('Post couldnot be created', {
        extensions: {
          code: 'SERVER_ERROR',
          http: { status: 500 },
        },
      });
    }
  };
}
