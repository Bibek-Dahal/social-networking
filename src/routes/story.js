import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { StoryValidator } from '../middlewares/validators/story.js';
import { StoryController } from '../controllers/story.js';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  upload.single('image'),
  StoryValidator.createStory,
  StoryController.create,
]);

router.get('/list-viewers/:storyId/', StoryController.listViewers);

router.put('/add-reply/:storyId', [
  StoryValidator.addReply,
  StoryController.addReply,
]);

router.get('/stories', StoryController.listAllStories);
router.get('/:storyId', [StoryController.getStory]);
router.delete('/:storyId', [StoryController.deleteStory]);

export default router;
