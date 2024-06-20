import CryptoJS from 'crypto-js';
import urlsafeBase64 from 'urlsafe-base64';
// import AES from 'crypto-js/aes';
import { Base64 } from 'js-base64';

export const encryptData = ({ data, secretKey }) => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  ).toString();
  console.log('before-enc==', encryptedData);
  return Base64.encode(encryptedData);
  //   encryptedData;
};

export const decryptData = ({ encryptedData, secretKey }) => {
  console.log(secretKey);
  console.log(encryptedData);
  const decryptedData = CryptoJS.AES.decrypt(
    Base64.decode(encryptedData),
    secretKey
  ).toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};
