import speakeasy from "speakeasy";
import QRcode from "qrcode";
import "dotenv/config";
import * as OTPAuth from "otpauth";

// export function verifyOTP(req, res, next) {
//   const key = process.env.AUTH_SECRET_KEY;
//   console.log(req.body.key);
//   const verified = speakeasy.totp.verify({
//     secret: key,
//     encoding: "base32",
//     token: req.body.key,
//   });

//   console.log("verified==", verified);

//   if (verified) {
//     return res.status(200).send({
//       success: true,
//       message: "otp verified successfully",
//     });
//   } else {
//     return res.status(200).send({
//       success: false,
//       message: "otp verification failed",
//     });
//   }

//   return verified;
// }

export const verifyOTP = (req, res, next) => {
  const secret = process.env.AUTH_SECRET_KEY;
  console.log("secret==", secret);
  let totp = new OTPAuth.TOTP({
    // Provider or service the account is associated with.
    issuer: "codingsword.com",
    // Account identifier.
    label: "codingsword",
    // Algorithm used for the HMAC function.
    algorithm: "SHA1",
    // Length of the generated tokens.
    digits: 6,
    // Interval of time for which a token is valid, in seconds.
    period: 30,
    secret: secret,
  });
  console.log(req.body.key);
  let delta = totp.validate({ token: req.body.key });
  console.log("delta===", delta);

  if (delta) {
    return res.status(200).send({
      status: "success",
      message: "Authentication successful",
    });
  } else {
    return res.status(401).send({
      status: "fail",
      message: "Authentication failed",
    });
  }
};
