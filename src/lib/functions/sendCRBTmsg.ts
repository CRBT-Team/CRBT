import { links } from '$lib/env';
import { timestampMention } from '@purplet/utils';
import { EmbedFieldData, MessageEmbedOptions } from 'discord.js';
import { ModerationAction } from '../../modules/moderation/_base';

export enum CRBTMessageSourceType {
  Moderator = 'MODERATOR',
  CRBTTeam = 'CRBT_TEAM',
}

export enum OfficialMessageType {
  FixedBugReport = 'BUG_REPORT_FIXED',
  DeniedBugReport = 'BUG_REPORT_DENIED',
  LabsAnnouncement = 'LABS',
  DeveloperNotice = 'DEV_NOTICE',
}

export const actionTypes = { ...OfficialMessageType, ...ModerationAction };

export type ActionTypes = typeof actionTypes[keyof typeof actionTypes];

function getMessageTitle(action: ActionTypes, guildName: string) {
  const messages: Partial<Record<ActionTypes, string>> = {
    [ModerationAction.UserBan]: `You have been banned from ${guildName}.`,
    [ModerationAction.UserKick]: `You have been kicked from ${guildName}.`,
    [ModerationAction.UserWarn]: `You have been warned from ${guildName}.`,
    [ModerationAction.UserTimeout]: `You have been warned from ${guildName}.`,
    [ModerationAction.UserTemporaryBan]: `You have been temporarily banned from ${guildName}.`,
    LABS: 'Labs notification from the CRBT Team.',
    DEV_NOTICE: 'Message from the CRBT Team',
    BUG_REPORT_DENIED: 'Your bug report was denied.',
    BUG_REPORT_FIXED: "A bug you've reported was fixed!",
  };

  return `${messages[action]}`;
}

export function createCRBTmsg({
  source,
  action,
  message,
  guildName,
  endDate,
  locale,
}: {
  source: CRBTMessageSourceType;
  action: ActionTypes;
  message?: string;
  guildName?: string;
  endDate?: Date;
  locale: string;
}): MessageEmbedOptions {
  const fields: EmbedFieldData[] = [];

  if (message) {
    fields.push({
      name: source === CRBTMessageSourceType.CRBTTeam ? 'Message' : 'Reason',
      value: message,
    });
  }

  if (endDate) {
    fields.push({
      name: 'Ends on',
      value: `${timestampMention(endDate)} • ${timestampMention(endDate, 'R')}`,
    });
  }

  return {
    title: getMessageTitle(action, guildName),
    description:
      (source === CRBTMessageSourceType.CRBTTeam
        ? 'This message was delivered to you by a verified CRBT developer.'
        : `This message was delivered to you by a moderator from **${guildName}**.`) +
      ` **[Learn more about CRBT messages](${links.blog['about-crbt-messages']})**.`,
    fields,
    footer: {
      text:
        'CRBT will never ask for your Discord account credentials, or give you free stuff. Beware of scams!' +
        (source === CRBTMessageSourceType.Moderator
          ? '\nCRBT is not affiliated with this message or with this server.'
          : ''),
    },
  };
}
