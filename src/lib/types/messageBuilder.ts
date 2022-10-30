import {
  CommandInteraction,
  MessageActionRow,
  MessageComponentInteraction,
  MessageEmbedOptions,
  ModalSubmitInteraction,
} from 'discord.js';

export interface BaseMessageData {
  content?: string;
  embed?: Partial<MessageEmbedOptions>;
}

export enum MessageBuilderTypes {
  joinMessage = 'JOIN_MESSAGE',
  leaveMessage = 'LEAVE_MESSAGE',
  rolePicker = 'ROLE_PICKER',
}

export interface RolePickerData extends BaseMessageData {
  type: MessageBuilderTypes.rolePicker;
  components?: MessageActionRow[];
}

export interface JoinLeaveData extends BaseMessageData {
  type: MessageBuilderTypes.joinMessage | MessageBuilderTypes.leaveMessage;
  script?: string;
}

export type MessageBuilderData = JoinLeaveData | RolePickerData;

export interface MessageBuilderProps {
  data: MessageBuilderData;
  interaction: CommandInteraction | ModalSubmitInteraction | MessageComponentInteraction;
}

// [id, name, maxLength, markdownSupport, CRBTscriptSupport
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
