type time =
  | `${number}w`
  | `${number}d`
  | `${number}h`
  | `${number}m`
  | `${number}s`
  | `${number}ms`;

type discordbadge = {};

type item = {
  fullName: string;
  value: number;
  available: boolean;
  url: string;
};

type profilebanner = item & {
  name: string;
  season: number | 'special';
};

type profilebadge = item & {
  name: string;
  emoji: string;
  category: string;
};

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

interface profile {
  name?: string;
  verified?: boolean;
  bio?: string;
  purplets: number;
  badges?: profilebadge[];
  banner?: profilebanner;
  accent_color?: `#${string}`;
  url?: string;
  location?: string;
  pronouns?: string;
  likes?: number;
  birthday?: date;
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
  profile: profile;
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

let u: user;

`${u}`;
