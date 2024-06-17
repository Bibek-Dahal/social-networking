export const saltRound = 8;
// export const accessTokenLifeTime = 200;
export const accessTokenLifeTime = 3000;
export const refreshTokenLifeTime = 15 * 24 * 60 * 60;
export const verificationEmailLifeTime = 3 * 24 * 60 * 60;
// Math.floor(Date.now() / 1000) + 5;

export const userRoles = {
  User: 'User',
  Admin: 'Admin',
};

export const SubscriptionPeriod = {
  Minutes: 'Minutes',
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  SemiAnnually: 'SemiAnnually',
  Annually: 'Annually',
};

export const EventStatus = {
  Active: 'Active',
  Ongoing: 'Ongoing',
  Ended: 'Ended',
};

export const subscriptionRate = 500;
export const serverError = {
  message: 'Something went wrong',
  success: false,
};
