import { Post } from '../models/post.js';
import { PostRepository } from '../repository/postRepository.js';
import { UserRepository } from '../repository/userRepository.js';

const listUserPost = async (_, args, context) => {
  console.log('List user post called', context.user);
  const posts = await Post.find().populate('user');

  return posts;
};

export const resolvers = {
  Query: {
    listUserPosts: (_, args, context) => UserRepository.listUserPost(context),
    getLoggedInUser: (_, args, context) =>
      UserRepository.getUserFromToken(context.token),
  },

  Mutation: {
    createPost: (_, args, context) => PostRepository.createPost(args, context),
  },
};
