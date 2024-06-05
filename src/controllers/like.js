import { Post } from "../models/post.js";
import { Like } from "../models/likes.js";

export class LikeController {
  static createDeleteLike = async (req, res) => {
    const { postId } = req.params;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).send({
          message: "Post not found",
          success: false,
        });
      }

      const like = await Like.findOne({ post: postId, user: req.user.id });
      console.log("like==", like);
      if (!like) {
        console.log("inside if like=");
        await Like.create({
          user: req.user.id,
          post: postId,
        });
        console.log("like-count", post.likeCount);
        post.likeCount += 1;
        await post.save();
        return res.status(200).send({
          success: true,
          message: "Like created successfully",
        });
      } else {
        await Like.deleteOne({ _id: like.id });
        post.likeCount -= 1;
        await post.save();
        return res.status(200).send({
          success: true,
          message: "Like removed successfully",
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };

  static listAllLikeOfPost = async (req, res) => {
    const { postId } = req.params;
    try {
      const likes = await Like.find(
        { post: postId },
        { createdAt: 0, updatedAt: 0 }
      ).populate({
        path: "user",
        select: "userName email profile",
        populate: { path: "profile", select: "avatar" },
      });
      return res.status(200).send({
        success: true,
        data: likes,
        message: "Like fetched successfully",
      });
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };
}
