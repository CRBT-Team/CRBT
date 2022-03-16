import { MessageActionRow, MessageActionRowComponentResolvable } from 'discord.js';

export function row(...components: MessageActionRowComponentResolvable[] | null): MessageActionRow {
  return new MessageActionRow().addComponents(components.filter((c) => c));
}
