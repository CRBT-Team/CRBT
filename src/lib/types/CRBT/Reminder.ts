export type Reminder = {
  id: number;
  expiration: Date;
  user_id: string;
  destination: string | 'dm';
  reminder: string;
};
