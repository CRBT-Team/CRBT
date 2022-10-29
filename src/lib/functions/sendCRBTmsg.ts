import { icons, links } from '$lib/env';
import { timestampMention } from '@purplet/utils';
import { User } from 'discord.js';

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
  expiration?: Date;
}) {
  return {
    author: {
      name: "You've got mail!",
      icon_url: icons.information,
    },
    description: `${
      type === 'issue'
        ? `This message was delivered by a verified CRBT developer.`
        : `This message was delivered by a moderator from **${guildName}**.\nCRBT is not affiliated with this message this moderator and this server.`
    }\nLearn more about CRBT messages **[here](${links.blog['about-crbt-messages']})**.`,
    fields: [
      {
        name: 'Subject',
        value: subject,
      },
      ...(message ? [{ name: `Message from ${user.tag}`, value: message }] : []),
      ...(expiration
        ? [
            {
              name: 'Expires at',
              value: `${timestampMention(expiration)} • ${timestampMention(expiration, 'R')}`,
            },
          ]
        : []),
    ],
  };
}
