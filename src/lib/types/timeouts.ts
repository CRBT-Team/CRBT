import { Giveaway as RawGiveaway, Poll as RawPoll, Reminder as RawReminder } from '@prisma/client';

export enum TimeoutTypes {
  Giveaway = 'giveaway',
  Poll = 'poll',
  Reminder = 'reminder',
}

interface Reminder extends RawReminder {
  type: TimeoutTypes.Reminder;
}

interface Giveaway extends RawGiveaway {
  type: TimeoutTypes.Giveaway;
}

interface Poll extends RawPoll {
  type: TimeoutTypes.Poll;
}

export type RawTimeout = RawReminder | RawGiveaway | RawPoll;
export type Timeout = Reminder | Giveaway | Poll;
