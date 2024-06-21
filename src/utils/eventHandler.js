import EventEmitter from 'node:events';
export const eventEmitter = new EventEmitter();
eventEmitter.on('increasePostCount', async (user) => {
  console.log('started');
  user.userPostCount += 1;
  await user.save();
});
