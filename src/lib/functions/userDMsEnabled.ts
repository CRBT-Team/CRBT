import { User } from 'discord.js';

export const userDMsEnabled = async (user: User) => {
  let enabled = true;
  await user.send('').catch(() => (enabled = false));
  console.log(enabled);
  return enabled;
};
