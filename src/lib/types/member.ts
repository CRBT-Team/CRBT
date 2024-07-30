import { GuildMember, Item, MemberItem as MItem } from '@prisma/client';

export type FullGuildMember = GuildMember & {
  items: MemberItem[];
};

export type MemberItem = MItem & { item: Item };
