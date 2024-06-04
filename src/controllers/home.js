import { Post } from "../models/post.js";
export class HomeController {
  static homeFeed = async (req, res) => {
    try {
      const userFollowings = req.user.following;
      console.log(userFollowings);
      const posts = await Post.find({ user: { $in: userFollowings } })
        .populate("user", "userName email user comments")
        .populate({
          path: "comments",
          select: "user",
          populate: { path: "user", select: "email userName" },
        });
      return res.status(200).send({
        data: posts,
        success: true,
        message: "Post fetched successfully",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };
}
