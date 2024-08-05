import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import multer from 'multer';
import { StoryValidator } from '../middlewares/validators/story.js';
import { StoryController } from '../controllers/story.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  upload.single('image'),
  StoryValidator.createStory,
  StoryController.create,
]);

export default router;
