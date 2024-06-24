import mongoose from 'mongoose';

export const checkMongoId = (req, res, next) => {
  if (Object.keys(req.params).length > 0) {
    for (let key in req.params) {
      console.log(`key===${key}`);
      if (!mongoose.Types.ObjectId.isValid(req.params[key])) {
        return res.status(404).send({
          success: false,
          message: `${key} is not valid mongoose id`,
        });
      }
    }
  } else {
    next();
  }
};
