import { Giveaway, Poll, Reminder } from "@prisma/client";

export enum TimeoutTypes {
  Giveaway = 'giveaway',
  Poll = 'poll',
  Reminder = 'reminder',
}

export type Timeout = Reminder | Poll | Giveaway;
