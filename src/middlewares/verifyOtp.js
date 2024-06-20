import speakeasy from 'speakeasy';
import QRcode from 'qrcode';
import 'dotenv/config';
import * as OTPAuth from 'otpauth';

const tolerance = 6 * 30;
export const verifyOTP = (req, res, next) => {
  const secret = process.env.AUTH_SECRET_KEY;
  console.log('secret==', secret);
  // let totp = new OTPAuth.TOTP({
  //   // Provider or service the account is associated with.
  //   issuer: 'codingsword.com',
  //   // Account identifier.
  //   label: 'codingsword',
  //   // Algorithm used for the HMAC function.
  //   algorithm: 'SHA1',
  //   // Length of the generated tokens.
  //   digits: 6,
  //   // Interval of time for which a token is valid, in seconds.
  //   period: 30,
  //   secret: secret,
  // });

  const delta = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: req.body.key,
    // window: 4,
  });
  console.log(req.body.key);
  // let delta = totp.validate({ token: req.body.key, window: 15 });
  console.log('delta===', delta);

  if (delta) {
    return res.status(200).send({
      status: 'success',
      message: 'Authentication successful',
    });
  } else {
    return res.status(401).send({
      status: 'fail',
      message: 'Authentication failed',
    });
  }
};
