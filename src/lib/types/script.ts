type time =
  | `${number}w`
  | `${number}d`
  | `${number}h`
  | `${number}m`
  | `${number}s`
  | `${number}ms`;

type discordbadge = {};

interface date {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  unix: number;
  toString: () => `<t:${number}>`;
}

interface user {
  name: string;
  discrim: string;
  tag: string;
  id: string;
  avatar: string;
  banner: string;
  nickname: string;
  created: date;
  joined: date;
  isBot: boolean;
  badges: discordbadge[];
  ban: (time?: time) => void;
  kick: () => void;
  timeout: (time: time) => void;
  strike: () => void;
  changeNickname: (nickname: string) => void;
  toString: () => `<@${string}>`;
}

interface role {}

interface channel {
  name: string;
}

interface server {
  name: string;
  id: string;
  icon: string;
  owner: user;
  created: Date;
  roles: role[];
}
