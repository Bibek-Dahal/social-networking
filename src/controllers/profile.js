import { Profile } from "../models/profile.js";
export class ProfileController {
  static updateProfle = async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.file);
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile.bio = req.body.bio != undefined ? req.body.bio : profile.bio;
        profile.hobbies =
          req.body.hobbies != undefined ? req.body.hobbies : profile.hobbies;
        if (req.file) {
          profile.avatar =
            req.file.filename != undefined ? req.file.filename : profile.avatar;
        }

        profile.save();
        return res.status(200).send({
          message: "Profile updated successfully",
          success: true,
        });
      } else {
        res.status(404).send({
          message: "profile not found",
          success: false,
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
