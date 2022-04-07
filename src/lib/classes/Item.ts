import { items } from '$lib/db';
import type { BadgeNames, BannerNames } from '$lib/types/CRBT/APIProfile';
import { EmojiRegex } from '$lib/util/regex';

type APIBanner = {
  name: string;
  season: number | 'special';
  value: number;
  credits: string;
};

export class Item {
  public fullName: string;
  public value: number;
  public available: boolean;
  public url: string;
  public toString: () => string;
}

export class Banner extends Item {
  public name: BannerNames;
  public season: 'special' | number;

  constructor(name: BannerNames) {
    super();
    const banner = items.banners[name] as APIBanner;

    this.name = name;
    this.season = banner.season;
    this.fullName = banner.name;
    this.value = banner.value;
    this.available = banner.season !== 'special' && banner.season === 3;
    this.url = `https://crbt.ga/banners/${banner.season}/${name}.png`;
    this.toString = () => this.url;
  }
}

export class Badge extends Item {
  public name: BadgeNames;
  public emoji: string;
  public category: string;

  constructor(name: BadgeNames) {
    super();
    const badge = items.badges[name];

    this.name = name;
    this.fullName = badge.name;
    this.emoji = badge.contents;
    this.value = badge.value;
    this.available = badge.available;
    this.url = EmojiRegex.test(badge.contents)
      ? `https://cdn.discordapp.com/emojis/${badge.contents.replace(EmojiRegex, '$2')}.png`
      : badge.contents;
    this.category = badge.type;
    this.toString = () => this.emoji;
  }
}
