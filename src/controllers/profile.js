import { Profile } from '../models/profile.js';
export class ProfileController {
  static updateProfle = async (req, res) => {
    try {
      console.log(req.body);

      if (req.file) {
        req.body.avatar = req.file.filename;
      }
      if (req.body.phoneNumber) {
        const userWithPhnExists = await Profile.findOne({
          $and: [
            { user: { $ne: req.user.id } },
            { phoneNumber: req.body.phoneNumber },
          ],
        });
        if (userWithPhnExists) {
          return res.status(400).send({
            message: 'User with phone number already exists',
            success: false,
          });
        }
      }

      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: req.body },
        // req.body,
        { new: true }
      );
      return res.status(200).send({
        message: 'Profile updated successfully',
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Something went wrong',
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
          message: 'Profile fetched successfully',
          data: profile,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: 'Profile not found',
        });
      }
    } catch (error) {
      res.status(500).send({
        message: 'Something went wrong',
        success: false,
      });
    }
  };

  static getProfileById = async (req, res) => {
    const { profileId } = req.params;
    try {
      const profile = await Profile.findById(profileId);
      let profileToSend = profile.toObject();
      if (!profile) {
        return res.status(404).send({
          success: false,
          message: 'Profile not found',
        });
      }
      console.log('show phone number', profile.showPhoneNumber);
      if (!profile.showPhoneNumber) {
        console.log('inside if');

        delete profileToSend.phoneNumber;
      }

      return res.status(200).send({
        success: true,
        data: profileToSend,
        message: 'Profile fetched.',
      });
    } catch (error) {
      res.status(500).send({
        message: 'Something went wrong',
        success: false,
      });
    }
  };
}
