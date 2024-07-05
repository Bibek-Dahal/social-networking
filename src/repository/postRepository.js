import { Post } from '../models/post.js';
import { UserRepository } from './userRepository.js';
import { GraphQLError } from 'graphql';

export class PostRepository {
  static createPost = async (args, context) => {
    console.log('_____args', args);
    const { title, description } = args.content;
    try {
      const post = await Post.create({
        title,
        description,
        user: context.user.id,
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

  static getPostById = async (args, context) => {};
}
