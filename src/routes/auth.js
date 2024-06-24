import express from 'express';
import { AuthController } from '../controllers/auth.js';
import { AuthValidator } from '../middlewares/validators/auth_validator.js';
import { authMiddleware } from '../middlewares/auth.js';
import { userBlockMiddleware } from '../middlewares/userBlockMiddleware.js';
import { verifyOTP } from '../middlewares/verifyOtp.js';
import passport from 'passport';

const router = express.Router();

router.post('/register', [AuthValidator.register, AuthController.register]);
router.get(
  '/login/google',
  passport.authenticate(
    'google',

    {
      session: false,
      scope: ['email', 'profile'],
    }
  )
);
router.get(
  '/oauth2/redirect/google',
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureMessage: true,
    session: false,
  }),
  async function (req, res) {
    console.log('User login successfull', req.user);
    const { accessToken, refreshToken } = await req.user.generateJwtTokens();
    const response = JSON.stringify({
      accessToken,
      refreshToken,
      data: {
        id: req.user.id,
        email: req.user.email,
        userName: req.user.userName,
      },
    });
    const encodedString = btoa(response);
    // return res.status(200).send({
    //   success: true,
    //   message: "Google login successful",
    //   data: {
    //     jsonEncode: encodedString,
    //   },
    // });

    res.redirect(`/?data=${encodedString}`);
  }
);
router.post('/login', [AuthValidator.login, AuthController.login]);
router.post('/password-change', [
  authMiddleware,
  AuthValidator.passwordChange,
  AuthController.passwordChange,
]);
router.post('/password-reset', [
  AuthValidator.passwordReset,
  AuthController.passwordReset,
]);

router.post('/password-reset-confirm/:token', [
  AuthValidator.passwordResetConfirm,
  AuthController.passwordResetConfirm,
]);

router.post('/logout', [
  authMiddleware,
  AuthValidator.logout,
  AuthController.logout,
]);
router.post('/logout-from-all-devices', [
  authMiddleware,
  AuthController.logoutFromAllDevice,
]);

router.post('/token/refresh', [
  AuthValidator.refreshToken,
  AuthController.generateNewAccessToken,
]);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/verify-otp', AuthController.verifyUserOtp);

export default router;
