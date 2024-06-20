import speakeasy from 'speakeasy';
import QRcode from 'qrcode';
import 'dotenv/config';
import * as OTPAuth from 'otpauth';

export const verifyOTP = (secret, otp) => {
  console.log('secret==', secret);

  const delta = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: otp,
    // window: 4,
  });

  // let delta = totp.validate({ token: req.body.key, window: 15 });
  console.log('delta===', delta);
  return delta;
  // if (delta) {
  //   return res.status(200).send({
  //     status: 'success',
  //     message: 'Authentication successful',
  //   });
  // } else {
  //   return res.status(401).send({
  //     status: 'fail',
  //     message: 'Authentication failed',
  //   });
  // }
};
