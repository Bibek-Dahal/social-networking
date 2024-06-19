import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { EventValidator } from '../middlewares/validators/event.js';
import { EventController } from '../controllers/events.js';
const router = express.Router();
router.use(authMiddleware);

router.post('/', [EventValidator.createEvent, EventController.createEvent]);
router.patch('/:eventId', [
  EventValidator.updateEvent,
  EventController.updateEvent,
]);
router.get('/', EventController.listAllEvents);
router.delete('/:eventId', EventController.deleteEvent);

export default router;
