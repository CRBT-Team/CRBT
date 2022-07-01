import { icons, links } from '$lib/db';
import { Dayjs } from 'dayjs';
import { MessageEmbed, User } from 'discord.js';

export function createCRBTmsg({
  type,
  user,
  subject,
  message,
  guildName,
  expiration,
}: {
  type: 'issue' | 'moderation';
  user: User;
  subject: string;
  message?: string;
  guildName?: string;
  expiration?: Dayjs;
}) {
  return new MessageEmbed()
    .setAuthor({
      name: "You've got mail!",
      iconURL: icons.information,
    })
    .setDescription(
      `${
        type === 'issue'
          ? `This message was delivered by a verified CRBT developer.`
          : `This message was delivered by a moderator from **${guildName}**.\nCRBT is not affiliated with this message this moderator and this server.`
      }\nLearn more about CRBT messages **[here](${links.blog['about-crbt-messages']})**.`
    )
    .addField('Subject', subject)
    .addFields(
      ...(message ? [{ name: `Message from ${user.tag}`, value: message }] : []),
      ...(expiration
        ? [{ name: 'Expires at', value: `<t:${expiration.unix()}> (<t:${expiration.unix()}:R>)` }]
        : [])
    );
}
