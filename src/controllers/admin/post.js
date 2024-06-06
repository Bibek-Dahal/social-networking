import { Post } from "../../models/post.js";

export class AdminPostController {
  static listPost = async (req, res) => {
    try {
      const posts = await Post.find({}, { password: 0 })
        .populate({
          path: "user",
          select: "userName email profile",
          populate: { path: "profile" },
        })
        .limit(10);
      return res.status(200).send({
        data: posts,
        success: true,
        message: "Post fetched successfully",
      });
    } catch (error) {
      return res.status(500).send({
        success: true,
        message: "Something went wrong",
      });
    }
  };
}
