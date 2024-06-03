import Post from "../models/post.js";
export class PostController {
  static createPost = async (req, res) => {
    try {
      const data = req.body;
      data.user = req.user.id;
      if (req.file) {
        data.image = req.file.filename;
      }
      const post = await Post.create(data);
      return res.status(201).send({
        message: "Post created successfully",
        success: true,
        data: post,
      });
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };
}
