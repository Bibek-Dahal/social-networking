import { Post } from "../models/post.js";
export class HomeController {
  static homeFeed = async (req, res) => {
    try {
      const userFollowings = req.user.following;
      console.log(userFollowings);
      const posts = await Post.find({ user: { $in: userFollowings } })
        .populate(
          {
            path: "user",
            select: "userName email profile",
            populate: { path: "profile", select: "avatar bio " },
          }
          // "user",
          // "userName email profile"
        )
        .limit(2);
      // .populate({
      //   path: "comments",
      //   select: "user",
      //   populate: { path: "user", select: "email userName" },
      // });
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
