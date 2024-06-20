import speakeasy from 'speakeasy';
import QRcode from 'qrcode';
import base32 from 'hi-base32';
import crypto from 'crypto';

// import "dotenv/config";

// export function generateQRCodeURL() {
const secret = speakeasy.generateSecret({ length: 20 });
//   console.log("secret==", secret);

//   return new Promise((resolve, reject) => {
//     QRcode.toDataURL(secret.otpauth_url, (err, dataURL) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(dataURL);
//       }
//     });
//   });
// }

import * as OTPAuth from 'otpauth';

const generateBase32Secret = () => {
  const buffer = crypto.randomBytes(15);
  const secret = base32.encode(buffer).replace(/=/g, '').substring(0, 24);
  return secret;
};

const generateTtop = () => {
  let secret = generateBase32Secret();
  // new OTPAuth.Secret({ size: 20 });
  // speakeasy.generateSecret({ length: 20 });

  // Convert the buffer to a base32 encoded string (typically used for OTP)
  // let secret = secretBuffer.base32;

  console.log('secret===', secret);
  let totp = new OTPAuth.TOTP({
    // Provider or service the account is associated with.
    issuer: 'codingsword.com',
    // Account identifier.
    label: 'codingsword',
    // Algorithm used for the HMAC function.
    algorithm: 'SHA1',
    // Length of the generated tokens.
    digits: 6,
    // Interval of time for which a token is valid, in seconds.
    period: 30,
    // Arbitrary key encoded in Base32 or OTPAuth.Secret instance.
    secret: secret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
  });

  let otpauth_url = totp.toString();
  return { otpauth_url, secret };
};

export function generateQRCodeURL() {
  const { otpauth_url, secret } = generateTtop();
  console.log('otpAuthUrl==', otpauth_url);

  return new Promise((resolve, reject) => {
    QRcode.toDataURL(otpauth_url, (err, dataURL) => {
      if (err) {
        reject(err);
      } else {
        resolve({ QR: dataURL, secret });
      }
    });
  });
}

// QRCode.toDataURL(otpauth_url, (err) => {
//   if (err) {
//     return {
//       status: "fail",
//       message: "Error while generating QR Code",
//     };
//   }
//   return {
//     status: "success",
//     data: {
//       qrCodeUrl: qrUrl,
//       secret: base32_secret,
//     },
//   };
// });
