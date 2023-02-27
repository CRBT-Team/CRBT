import { CooldownError } from '$lib/functions/CRBTError';
import { MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { handleVote } from '../functions/renderPoll';
import { getPollData } from '../_helpers';

const usersOnCooldown = new Map();

export const VoteButton = ButtonComponent({
  async handle({ choiceId }) {
    if (usersOnCooldown.has(this.user.id) && usersOnCooldown.get(this.user.id) > Date.now()) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id), false));
    }

    const poll = await getPollData(`${this.channel.id}/${this.message.id}`);
    const pollEmbed = this.message.embeds[0] as MessageEmbed;

    this.update(await handleVote.call(this, choiceId, poll, pollEmbed));

    usersOnCooldown.set(this.user.id, Date.now() + 2500);
  },
});
