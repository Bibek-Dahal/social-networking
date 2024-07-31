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
  postUpload.single('image'),
  PostValidator.updatePost,
  PostController.updatePost,
]);
//list all user posts
router.get('/', [PostController.listAllPosts]);

router.delete('/:id', PostController.deletePost);

router.get('/:id', PostController.getPostById);

router.post('/add-remove-favourite/:postId', PostController.addFavouritePost);
router.get('/list-favourite-posts', PostController.addFavouritePost);

export default router;
