import { db } from '$lib/db';
import { Guild, User } from 'discord.js';
import { avatar } from './avatar';
import { banner } from './banner';
import { getColor } from './getColor';

export const CRBTscriptParser = async (text: string, user: User, guild: Guild) => {
  const profile = await db.profiles.findFirst({
    where: { id: user.id },
  });

  let values = {
    '<user.name>': user.username,
    '<user.id>': user.id,
    '<user.tag>': user.tag,
    '<purplets>': profile.purplets,
    '<user.avatar>': avatar(user),
    '<user.banner>': banner(user) ?? 'None',
    // '<user.status>': (await customStatus(guild, user)) ?? 'None',
    '<user.nickname>': (await guild.members.fetch(user)).nickname,
    '<newline>': '\n',
    '<profile.bio>': profile.bio ?? '',
    '<profile.name>': profile.name ?? '',
    '<profile.color>': (await getColor(user)) ?? 'None',
  };
  for (const val of Object.keys(values)) {
    text = text.replaceAll(val, values[val]);
  }
  return text;
};
