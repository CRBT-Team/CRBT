import { emojis } from '$lib/db';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { Guild, User } from 'discord.js';
import { avatar } from './avatar';
import { banner } from './banner';
import { getColor } from './getColor';

export const CRBTscriptParser = async (
  text: string,
  user: User,
  profile: APIProfile,
  guild?: Guild
) => {
  // const profile = await db.profiles.findFirst({
  //   where: { id: user.id },
  // });
  const member = guild ? await guild.members.fetch(user.id) : undefined;

  let values = {
    '<user.name>': user.username,
    '<user.discrim>': user.discriminator,
    '<user.tag>': user.tag,
    '<user.id>': user.id,
    '<user.avatar>': avatar(user),
    '<user.banner>': banner(user) ?? 'None',
    '<user.nickname>': member ? member.nickname : user.username,
    '<user.created>': user.createdAt.toISOString(),

    '<server.name>': guild ? guild.name : '',
    '<server.created>': guild ? guild.createdAt.toISOString() : '',
    '<server.owner>': guild ? guild.ownerId : '',
    '<server.icon>': guild ? guild.iconURL({ size: 2048, dynamic: true }) : '',
    '<server.id>': guild ? guild.id : '',

    '<profile.name>': profile.name ?? '',
    '<profile.bio>': profile.bio ?? '',
    '<profile.color>': await getColor(user),
    '<profile.verified>': profile.verified ? emojis.misc.verified : 'false',
    '<profile.purplets>': profile.purplets,

    '<newline>': '\n',
    '<purplets>': profile.purplets,
  };
  for (const val of Object.keys(values)) {
    text = text.replaceAll(val, values[val]);
  }
  return text;
};
