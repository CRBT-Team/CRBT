import { CRBTUser } from '$lib/classes/CRBTUser';
import { emojis } from '$lib/db';
import { Guild } from 'discord.js';
import { getDiscordClient } from 'purplet';
import pjson from '../../../package.json';
import { avatar } from './avatar';
import { banner } from './banner';
import { getColor } from './getColor';

export const CRBTscriptParser = async (text: string, profile: CRBTUser, guild?: Guild) => {
  const { user } = profile;
  const member = guild ? await guild.members.fetch(user.id) : undefined;
  const client = getDiscordClient();

  let values: [RegExp | string, any][] = [
    ['<user.name>', user.username],
    ['<user.discrim>', user.discriminator],
    ['<user.tag>', user.tag],
    ['<user.id>', user.id],
    ['<user.avatar>', avatar(user)],
    ['<user.banner>', banner(user) ?? 'None'],
    ['<user.nickname>', member ? member.nickname : user.username],
    ['<user.created>', user.createdAt.toISOString()],

    ['<server.name>', guild ? guild.name : ''],
    ['<server.created>', guild ? guild.createdAt.toISOString() : ''],
    ['<server.owner>', guild ? guild.ownerId : ''],
    ['<server.icon>', guild ? guild.iconURL({ size: 2048, dynamic: true }) : ''],
    ['<server.id>', guild ? guild.id : ''],

    ['<profile.name>', profile.name ?? ''],
    ['<profile.bio>', profile.bio ?? ''],
    ['<profile.color>', await getColor(user)],
    ['<profile.verified>', profile.verified ? emojis.verified : 'false'],
    ['<profile.purplets>', profile.purplets],

    ['<newline>', '\n'],
    ['<purplets>', profile.purplets ?? '0'],

    ['<crbt.name>', client.user.username],
    ['<crbt.tag>', client.user.tag],
    ['<crbt.id>', client.user.id],
    ['<crbt.version', pjson.version],
    ['<crbt.purplet.version>', pjson.dependencies.purplet.slice(1)],

    [/<rng.([0-9]*)>/g, (_, a) => Math.floor(Math.random() * parseInt(a))],

    [/<([0-9]+)([+\-\*\/])([0-9]+)>/g, (_, a, b, c) => (0, eval)(a + b + c)],
  ];
  for (const [regex, value] of values) {
    text = text.replaceAll(regex, value);
  }
  return text;
};
