import express from 'express';
import { PostController } from '../controllers/post.js';
import { postUpload } from '../config/multer_config.js';
import { PostValidator } from '../middlewares/validators/post_validator.js';
import { authMiddleware } from '../middlewares/auth.js';
import { userBlockMiddleware } from '../middlewares/userBlockMiddleware.js';
import { checkMongoId } from '../utils/checkIfMongoId.js';
const router = express.Router();

router.use(authMiddleware);
router.use(userBlockMiddleware);
router.post('/', [
  postUpload.single('image'),
  PostValidator.createPost,
  PostController.createPost,
]);

router.patch('/:id', [
  checkMongoId,
  postUpload.single('image'),
  PostValidator.updatePost,
  PostController.updatePost,
]);
//list all user posts
router.get('/', [PostController.listAllPosts]);

router.delete('/:id', checkMongoId, PostController.deletePost);

router.get('/:id', checkMongoId, PostController.getPostById);

export default router;
