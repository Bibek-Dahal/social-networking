import { serverError } from '../constants.js';
import { Test } from '../models/test.js';
import { prepareSearchQuery } from '../utils/prepareSearchQuery.js';

export class TestController {
  static createTest = async (req, res) => {
    try {
      const testWithEmail = await Test.findOne({
        email: req.body.email,
      });
      if (testWithEmail) {
        return res.status(400).send({
          message: 'User with email already exists',
          success: false,
        });
      }

      const test = await Test.create(req.body);
      return res.status(200).send({
        message: 'Test created successfully',
        success: true,
        data: test,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };

  static updateTest = async (req, res) => {
    const { testId } = req.params;
    try {
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).send({});
      }
      const testWithEmail = await Test.findOne({
        $and: [{ email: req.body.email }, { _id: { $ne: test._id } }],
      });
      if (testWithEmail) {
        return res
          .status(400)
          .send({ success: false, message: 'User with email already exists' });
      }
      await Test.updateOne(
        { _id: testId },
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).send({
        success: true,
        data: test,
        message: 'User update successful',
      });
    } catch (error) {
      return res.status(500).send(serverError);
    }
  };

  static deleteTest = async (req, res) => {
    const { testId } = req.params;
    try {
      const test = await Test.deleteOne({ _id: testId });
      if (!test) {
        return res.status(404).send({
          success: false,
          message: 'Document not found',
        });
      }
      return res.status(200).send({
        message: 'User deleted successfully',
        success: true,
      });
    } catch (error) {
      res.status(500).send(serverError);
    }
  };

  static listAllTest = async (req, res) => {
    try {
      const searchFields = ['email'];
      let filterQuery = {};
      let sq = prepareSearchQuery(req, searchFields);
      if (sq) {
        filterQuery = { ...filterQuery, ...sq };
      }
      const tests = await Test.find(filterQuery);
      return res.status(200).send({
        message: 'Test fetched successfully',
        success: true,
        data: tests,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };

  static getTestById = async (req, res) => {
    const { testId } = req.params;
    try {
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).send({
          success: false,
          message: 'Document not found',
        });
      }
      return res.status(200).send({
        success: true,
        message: 'Test found',
        data: test,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };
}
