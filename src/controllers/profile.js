import { Profile } from "../models/profile.js";
export class ProfileController {
  static updateProfle = async (req, res) => {
    try {
      console.log(req.body);

      if (req.file) {
        req.body.avatar = req.file.filename;
      }
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true }
      );
      return res.status(200).send({
        message: "Profile updated successfully",
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };

  static getProfile = async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        return res.status(200).send({
          success: true,
          message: "Profile fetched successfully",
          data: profile,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "Profile not found",
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "Something went wrong",
        success: false,
      });
    }
  };
}
