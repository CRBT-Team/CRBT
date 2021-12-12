import { emojis } from '$lib/db';
import { User } from 'discord.js';

export async function userBadges(user: User) {
  const e = emojis.badges;
  const badges = [];
  const flags = (await user.fetchFlags()).toArray();
  for (const flag of flags) {
    switch (flag) {
      case 'HOUSE_BRILLIANCE':
        badges.push(e.houses.brilliance);
        break;
      case 'HOUSE_BALANCE':
        badges.push(e.houses.balance);
        break;
      case 'HOUSE_BRAVERY':
        badges.push(e.houses.bravery);
        break;
      case 'BUGHUNTER_LEVEL_1':
        badges.push(e.bugHunter1);
        break;
      case 'BUGHUNTER_LEVEL_2':
        badges.push(e.bugHunter1);
        break;
      case 'EARLY_SUPPORTER':
        badges.push(e.earlySupporter);
        break;
      case 'HYPESQUAD_EVENTS':
        badges.push(e.hypesquad);
        break;
      case 'DISCORD_EMPLOYEE':
        badges.push(e.discordStaff);
        break;
      case 'PARTNERED_SERVER_OWNER':
        badges.push(e.partner);
        break;
      case 'EARLY_VERIFIED_BOT_DEVELOPER':
        badges.push(e.developer);
        break;
      case 'VERIFIED_BOT':
        badges.push(e.verifiedBot);
        break;
      case 'DISCORD_CERTIFIED_MODERATOR':
        badges.push('certified mod (no emoji for now)');
        break;
    }
  }
  return badges;
}
