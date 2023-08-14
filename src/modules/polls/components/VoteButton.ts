import { CooldownError } from '$lib/functions/CRBTError';
import { Message, MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { getPollData } from '../_helpers';
import { handleVote } from '../functions/renderPoll';
import { renderMenuButton } from './PollMenuButton';

const usersOnCooldown = new Map();

export const VoteButton = ButtonComponent({
  async handle({ messageId, choiceId }: { messageId?: string; choiceId: string }) {
    if (usersOnCooldown.has(this.user.id) && usersOnCooldown.get(this.user.id) > Date.now()) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id), false));
    }

    const poll = await getPollData(this.channel.id, messageId ?? this.message.id);
    const message: Message = messageId
      ? await this.channel.messages.fetch(messageId)
      : (this.message as Message);
    const pollEmbed = message.embeds[0] as MessageEmbed;

    if (messageId) {
      await this.deferUpdate({});

      await message.edit(await handleVote.call(this, choiceId, poll, pollEmbed));

      await this.editReply(await renderMenuButton.call(this, messageId, poll.creatorId));
    } else {
      this.update(await handleVote.call(this, choiceId, poll, pollEmbed));
    }

    usersOnCooldown.set(this.user.id, Date.now() + 2500);
  },
});
