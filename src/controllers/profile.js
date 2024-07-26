import { Profile } from '../models/profile.js';
import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse.js';
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
          return res
            .status(400)
            .send(
              new ErrorApiResponse('User with phone number already exists')
            );
        }
      }

      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: req.body },
        // req.body,
        { new: true }
      );
      return res.status(200).send(
        new SuccessApiResponse({
          message: 'Profile updated successfully',

          data: profile,
        })
      );
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static getProfile = async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        return res.status(200).send(
          new SuccessApiResponse({
            message: 'Profile fetched successfully',
            data: profile,
          })
        );
      } else {
        return res.status(404).send(new ErrorApiResponse('Profile not found'));
      }
    } catch (error) {
      res.status(500).send(new ErrorApiResponse());
    }
  };

  static getProfileById = async (req, res) => {
    console.log(req.params);
    const { profileId } = req.params;
    console.log('profiled===', profileId);
    try {
      const profile = await Profile.findById(profileId);

      if (!profile) {
        return res.status(404).send(new ErrorApiResponse('Profile not found'));
      }
      console.log('show phone number', profile.showPhoneNumber);
      if (!profile.showPhoneNumber) {
        console.log('inside if');

        delete profile.phoneNumber;
      }

      return res.status(200).send(
        new SuccessApiResponse({
          data: profile,
          message: 'Profile fetched.',
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).send(new ErrorApiResponse());
    }
  };
}
