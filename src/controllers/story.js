import { SuccessApiResponse, ErrorApiResponse } from '../utils/apiResponse';

class StoryController {
  static create = (req, res) => {
    try {
    } catch (error) {
      return res.send(500).send(new ErrorApiResponse());
    }
  };
}
