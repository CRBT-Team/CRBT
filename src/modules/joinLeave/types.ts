import { APIEmbed } from 'discord-api-types/v10';

export type MessageTypes = 'JOIN_MESSAGE' | 'LEAVE_MESSAGE';
export const resolveMsgType = {
  JOIN_MESSAGE: 'joinMessage',
  LEAVE_MESSAGE: 'leaveMessage',
};

export type JoinLeaveMessage = { script?: string; embed?: Partial<APIEmbed>; content?: string };

// [id, name, maxLength, markdownSupport, CRBTscriptSupport]
export const editableList: [editableNames, number, boolean, boolean][] = [
  ['content', 2048, true, true],
  ['author_name', 256, false, true],
  ['author_url', 256, false, false],
  ['author_icon', 256, false, true],
  ['title', 256, true, true],
  ['description', 2048, true, true],
  ['footer', 256, false, true],
  ['image', 256, false, true],
  ['thumbnail', 256, false, true],
  ['color', 7, false, false],
  ['url', 256, false, false],
];

export type editableNames =
  | 'content'
  | 'author_name'
  | 'author_url'
  | 'author_icon'
  | 'title'
  | 'description'
  | 'footer'
  | 'color'
  | 'image'
  | 'thumbnail'
  | 'url';

export interface RawServerJoin {
  joinMessage?: JoinLeaveMessage;
  joinChannel?: string;
}

export interface RawServerLeave {
  leaveMessage?: JoinLeaveMessage;
  leaveChannel?: string;
}
