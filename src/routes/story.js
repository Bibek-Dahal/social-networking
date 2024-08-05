import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import multer from 'multer';
import { StoryValidator } from '../middlewares/validators/story';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  upload.single('image'),
  StoryValidator.createStory,
  PostController.createPost,
]);
