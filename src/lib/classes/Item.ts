import { items } from '$lib/db';
import { EmojiRegex } from '$lib/util/regex';
import type { BadgeNames, BannerNames } from '$lib/util/types/APIProfile';

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
	public contents: string;
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
		this.contents = `https://crbt.ga/banners/${banner.season}/${name}.png`;
	}
}

export class Badge extends Item {
	public name: BadgeNames;
	public category: string;

	constructor(name: BadgeNames) {
		super();
		const badge = items.badges[name];

		this.name = name;
		this.fullName = badge.name;
		this.value = badge.value;
		this.available = badge.available;
		this.contents = EmojiRegex.test(badge.contents)
			? `https://cdn.discordapp.com/emojis/${badge.contents.replace(EmojiRegex, '$2')}.png`
			: badge.contents;
		this.category = badge.category;
	}
}
