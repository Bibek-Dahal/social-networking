import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { ChatController } from '../controllers/chat.js';
import { ChatValidator } from '../middlewares/validators/chat.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/private/:receiverId', [
  ChatValidator.createChat,
  ChatController.createPrivateMessage,
]);
router.get('/last-msg-with-users', [ChatController.listLastMsgWithUsers]);
router.get('/messages/:userId', ChatController.listAllMessages);
export default router;
