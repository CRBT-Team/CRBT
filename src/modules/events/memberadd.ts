import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('guildMemberAdd', (member) => {
  const { guild, client } = member;

  if (guild.id !== '949329353047687189') return;

  const channel = getDefaultChannel(guild);

  channel.send({
    content: `Welcome to the server, ${member}! We are now ${guild.memberCount} members!`,
    embeds: [new MessageEmbed().setTitle('Welcome to the server!').setDescription(undefined)],
  });
});

export function getDefaultChannel(guild: Guild) {
  const system = guild.systemChannel;
  if (system.permissionsFor(guild.me).has('SEND_MESSAGES')) return system;

  const general = guild.channels.cache.find(
    (c) =>
      c.name === 'general' &&
      c.type === 'GUILD_TEXT' &&
      c.permissionsFor(guild.me).has('SEND_MESSAGES')
  ) as TextChannel;

  if (general) return general;

  return guild.channels.cache
    .filter((c) => c.type === 'GUILD_TEXT' && c.permissionsFor(guild.me).has('SEND_MESSAGES'))
    .first() as TextChannel;
}
