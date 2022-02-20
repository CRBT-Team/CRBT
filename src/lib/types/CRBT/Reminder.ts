export type Reminder = {
  id?: bigint | number;
  reminder?: string;
  expiration: string | Date;
  user_id: string;
  destination: string;
  url: string;
};
