export const saltRound = 8;
export const accessTokenLifeTime = Math.floor(Date.now() / 1000) + 30;
export const refreshTokenLifeTime =
  Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60;
// Math.floor(Date.now() / 1000) + 5;
