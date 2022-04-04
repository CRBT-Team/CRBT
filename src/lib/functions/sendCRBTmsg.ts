import { illustrations, links } from '$lib/db';
import { MessageEmbed, User } from 'discord.js';

export function createCRBTmsg({
  type,
  user,
  subject,
  message,
  guildName,
}: {
  type: 'issue' | 'moderation';
  user: User;
  subject: string;
  message?: string;
  guildName?: string;
}) {
  return new MessageEmbed()
    .setAuthor({
      name: "You've got mail!",
      iconURL: illustrations.information,
    })
    .setDescription(
      type === 'issue'
        ? `This message was delivered by a verified CRBT developer.\nLearn more about CRBT messages **[here](${links.info.messages})**.`
        : `This message was delivered by a moderator from **${guildName}**.\nCRBT is not affiliated with this message this moderator and this server.\nLearn more about CRBT messages **[here](${links.info.messages})**.`
    )
    .addField('Subject', subject)
    .addFields(message ? [{ name: `Message from ${user.tag}`, value: message }] : []);
}
