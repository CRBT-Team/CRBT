export interface BaseTimeout {
  id: string;
  expiration: Date;
  locale: string;
  type: TimeoutTypes;
}

export enum TimeoutTypes {
  TempBan = 'TEMPBAN',
  Giveaway = 'GIVEAWAY',
  Poll = 'POLL',
  Reminder = 'REMINDER',
}

export interface TempBanData extends BaseTimeout {
  data: {
    userId: string;
    guildId: string;
    reason: string;
  };
  type: TimeoutTypes.TempBan;
}

export interface ReminderData extends BaseTimeout {
  data: {
    destination: string;
    subject: string;
    userId: string;
    url: string;
  };
  type: TimeoutTypes.Reminder;
}

export interface PollData extends BaseTimeout {
  data: {
    creatorId: string;
    choices: string[][];
  };
  type: TimeoutTypes.Poll;
}

export interface GiveawayData extends BaseTimeout {
  data: {
    creatorId: string;
    participants: string[];
  };
  type: TimeoutTypes.Giveaway;
}

export type TimeoutData = TempBanData | ReminderData | PollData | GiveawayData;
