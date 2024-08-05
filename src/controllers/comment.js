import { Comment } from '../models/comment.js';
import { Post } from '../models/post.js';
import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';

export class CommentController {
  static createComment = async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).send(new ErrorApiResponse('Post not found'));
      }

      post.commentCount += 1;
      await post.save();

      const commentObj = await Comment.create({
        user: req.user.id,
        post: post.id,
        comment: comment,
      });

      const populatedComment = await Comment.findById(commentObj.id).populate({
        path: 'user',
        select: '-password', // Exclude password field
      });

      return res.status(201).send(
        new SuccessApiResponse({
          data: {
            coment: populatedComment,
          },
          message: 'Comment created successfully',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static updateComment = async (req, res) => {
    const { commentId } = req.params;

    try {
      await Comment.findOneAndUpdate(
        { _id: commentId, user: req.user.id },
        req.body
      );
      res.status(200).send(
        new SuccessApiResponse({
          message: 'Comment Updated Successfully',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static deleteComment = async (req, res) => {
    const { commentId } = req.params;
    try {
      const comment = await Comment.findById(commentId);

      if (comment) {
        const post = await Post.findById(comment.post);

        if (comment.user == req.user.id || post.user == req.user.id) {
          await Comment.deleteOne({ _id: commentId });
        }
        if (post.commentCount != 0) {
          post.commentCount -= 1;
          await post.save();
        }

        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Comment Deleted Successfully',
          })
        );
      } else {
        return res
          .status(403)
          .send(new ErrorApiResponse('Comment couldnot be deleted'));
      }
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static getComment = async (req, res) => {
    const { commentId } = req.params;
    try {
      const comment = await Comment.findById(commentId).populate({
        path: 'user',
        select: '-password', // Exclude password field
      });
      if (comment) {
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Comment fetched successfully',
            data: comment,
          })
        );
      } else {
        return res.status(404).send(new ErrorApiResponse('Comment Not Found'));
      }
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static listAllCommentOfPost = async (req, res) => {
    const { postId } = req.params;
    try {
      const comments = await Comment.find({ post: postId })
        .populate({
          path: 'user',
          select: '-password', // Exclude password field
        })
        .populate('post');
      return res.status(200).send(
        new SuccessApiResponse({
          data: comments,
          message: 'comment fetched successfully',
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };
}
