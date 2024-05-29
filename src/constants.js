export const saltRound = 8;
export const accessTokenLifeTime = Math.floor(Date.now() / 1000) + 10;
export const refreshTokenLifeTime =
  Math.floor(Date.now() / 1000) + 24 * 60 * 60;
