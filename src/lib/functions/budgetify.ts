import { LowBudgetMessage } from '$lib/timeouts/handleReminder';
import { Message } from 'discord.js';

export function budgetify(message: Message): LowBudgetMessage {
  return {
    authorId: message.author.id,
    ...(message.content
      ? {
          content:
            message.content.length > 150 ? `${message.content.slice(0, 150)}...` : message.content,
        }
      : {}),
    ...(!message.content && message.embeds[0]
      ? {
          firstEmbed: {
            author: message.embeds[0].author,
            title: message.embeds[0].title,
            description: message.embeds[0].description,
            color: message.embeds[0].color,
          },
        }
      : {}),
  };
}
