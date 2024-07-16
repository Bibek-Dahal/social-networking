import { Post } from '../../models/post.js';
import { AuthService } from '../services/authServices.js';
import { AuthRepository } from './authRepository.js';
import { UserRepository } from './userRepository.js';
import { GraphQLError } from 'graphql';

export class PostRepository {
  static createPost = async (postInput, token) => {
    const user = await AuthService.getLoggedInUser(token);
    const { title, description } = postInput;
    try {
      const post = await Post.create({
        title,
        description,
        user: user.id,
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

  static listUserPost = async (token) => {
    const user = await AuthService.getLoggedInUser(token);
    const posts = await Post.find({ user: user.id }).populate('user');

    return posts;
  };

  static getPostById = async (token, postId) => {
    try {
      const user = await AuthService.getLoggedInUser(token);
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
      throw new GraphQLError('Something went wrong', {
        extensions: {
          code: 'SERVER_ERROR',
          http: { status: 500 },
        },
      });
    }
  };
}
