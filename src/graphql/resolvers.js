import { Post } from '../models/post.js';
import { AuthRepository } from './repository/authRepository.js';
import { PostRepository } from './repository/postRepository.js';
import { AuthService } from './services/authServices.js';

export const resolvers = {
  Query: {
    listUserPosts: (_, args, context) =>
      PostRepository.listUserPost(context.user.id),
    getLoggedInUser: (_, args, context) =>
      AuthService.getLoggedInUser(context.user.id),
    getPostById: (_, args, context) => PostRepository.getPostById(args.postId),
  },

  Mutation: {
    createPost: (_, args, context) =>
      PostRepository.createPost(args.input, context.user.id),
    register: (_, args, context) => AuthRepository.register(args.input),
    login: (_, args, context) => AuthRepository.login(args.input),
    refreshToken: (_, args, context) =>
      AuthRepository.refreshToken(args.refreshToken),
  },
};
