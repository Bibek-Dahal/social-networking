import { Event } from '../models/events.js';
import { serverError } from '../constants.js';
import moment from 'moment-timezone';
import mt from 'moment';
import { sendPriorNotification } from '../utils/cron-job.js';
export class EventController {
  static createEvent = async (req, res) => {
    try {
      req.body.user = req.user.id;
      req.body.startDate = moment
        .tz(req.body.startDate, req.body.timeZone)
        .utc();
      req.body.endDate = moment.tz(req.body.endDate, req.body.timeZone).utc();

      if (req.body.endDate.diff(req.body.startDate) <= 0) {
        return res.status(400).send({
          success: false,
          message: 'Start date cant be greater than end date',
        });
      }
      const data = await Event.create(req.body);
      sendPriorNotification(req.body.startDate);

      return res.status(201).send({
        message: 'Event created successfully',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };

  static updateEvent = async (req, res) => {
    const { eventId } = req.params;
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).send({
          message: 'Event not found',
          success: false,
        });
      }
      if (!event.user == req.user.id) {
        return res.status(403).send({
          message: 'You cant perfom this action',
          success: false,
        });
      }

      if (req.body.participents) {
        const participents = new Set(req.body.participents);
        req.body.participents = [...participents];
      }
      if (req.body.startDate) {
        req.body.startDate = moment.tz(req.body.endDate, event.timeZone).utc();
      }
      if (req.body.endDate) {
        req.body.endDate = moment.tz(req.body.endDate, event.timeZone).utc();
      }
      if (
        req.body.startDate &&
        req.body.endDate &&
        req.body.endDate.diff(req.body.startDate) <= 0
      ) {
        await event.updateOne(req.body);
      }
      const momentStartDate = mt.utc(event.startDate);
      console.log('momentStd---', momentStartDate);

      if (req.body.endDate && req.body.endDate.diff(momentStartDate) <= 0) {
        return res.status(400).send({
          success: false,
          message: 'Start date cant be greater than end date',
        });
      }
      await event.updateOne(req.body);

      return res.status(200).send({
        message: 'Event updated successfully',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };

  static listAllEvents = async (req, res) => {
    try {
      let filter = {
        user: req.user.id,
      };
      if (req.query.status) {
        filter.status = req.query.status;
      }
      const data = await Event.find(filter).populate({
        path: 'user',
        select: 'userName profile',
        populate: 'profile',
      });
      res.status(200).send({
        message: 'event fetched succesfully',
        data: data,
      });
    } catch (error) {
      res.status(500).send(serverError);
    }
  };

  static deleteEvent = async (req, res) => {
    try {
      const { eventId } = req.params.id;
      const deletedEvent = await Event.findOneAndDelete({
        _id: eventId,
        user: req.user.id,
      });
      if (!deletedEvent) {
        return res.status(404).send({
          message: 'Event not found',
          success: false,
        });
      }
      return res.status(200).send({
        message: 'Event deleted successfully',
        success: true,
      });
    } catch (error) {
      res.status(500).send(serverError);
    }
  };
}
