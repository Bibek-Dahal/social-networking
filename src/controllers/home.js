import { Post } from '../models/post.js';
import { Subscription } from '../models/subscription.js';
export class HomeController {
  static homeFeed = async (req, res) => {
    try {
      const userFollowings = req.user.following;
      console.log(userFollowings);

      //finds whom current user have subscribed to
      const subscribedUsers = await Subscription.find({
        subscribeFrom: req.user.id,
      });

      //filters if subscribed user is in following list of user
      const userFollowingFilter = subscribedUsers.filter((item) => {
        return !item.isExpired && userFollowings.includes(item.subscribeTo);
      });
      console.log('userFollowingFilter==', userFollowingFilter);
      // console.log("subscribed user====", subscribedUsers);

      const lookupPosts = await Post.aggregate([
        {
          $match: {},
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] }, // Take the first (and only) element from popuser array
          },
        },
        {
          $project: {
            'user.password': 0,
            // Exclude the password field from popuser
            // Add other fields to project if needed
          },
        },
      ]);

      console.log('lookupPosts====', lookupPosts);
      const posts = await Post.find({ user: { $in: userFollowingFilter } })
        .populate(
          {
            path: 'user',
            select: 'userName email profile',
            populate: { path: 'profile', select: 'avatar bio ' },
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
        message: 'Post fetched successfully',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: 'Something went wrong',
        success: false,
      });
    }
  };
}
