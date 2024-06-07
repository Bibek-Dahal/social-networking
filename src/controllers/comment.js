import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";

export class CommentController {
  static createComment = async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).send({
          message: "Post not found",
          success: false,
        });
      }

      post.commentCount += 1;
      await post.save();

      await Comment.create({
        user: req.user.id,
        post: post.id,
        comment: comment,
      });

      return res.status(201).send({
        success: true,
        message: "Comment created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };

  static updateComment = async (req, res) => {
    const { commentId } = req.params;

    try {
      await Comment.findOneAndUpdate(
        { _id: commentId, user: req.user.id },
        req.body
      );
      res.status(200).send({
        message: "Comment Updated Successfully",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };

  static deleteComment = async (req, res) => {
    const { commentId } = req.params;
    try {
      const comment = await Comment.findById(commentId);

      if (comment) {
        const post = await Post.findById(comment.post);

        if (comment.user == req.user.id || post.user == req.user.id) {
          Comment.deleteOne({ _id: commentId });
        }

        post.commentCount -= 1;
        await post.save();
        return res.status(200).send({
          message: "Comment Deleted Successfully",
          success: true,
        });
      } else {
        return res.status(403).send({
          message: "Comment couldnot be deleted",
          success: true,
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };

  static getComment = async (req, res) => {
    const { commentId } = req.params;
    try {
      const comment = await Comment.findById(commentId);
      if (comment) {
        return res.status(200).send({
          success: true,
          message: "Comment fetched successfully",
          data: comment,
        });
      } else {
        return res.status(404).send({
          success: true,
          message: "Comment Not Found",
          data: comment,
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };

  static listAllCommentOfPost = async (req, res) => {
    const { postId } = req.params;
    try {
      const comments = await Comment.find({ post: postId }).populate("post");
      return res.status(200).send({
        success: true,
        data: comments,
        message: "comment fetched successfully",
      });
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };
}
