import speakeasy from "speakeasy";

export function generateSecretKey() {
  // Generate a secret key
  const secretKey = speakeasy.generateSecret();

  return secretKey;
}
