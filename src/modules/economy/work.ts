import { colors, emojis, jobs } from '$lib/db';
import { CooldownError, CRBTError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { getLevelFromExp, Jobs } from '$lib/util/Jobs';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';

const usersOnCooldown = new Map();

export default ChatCommand({
  name: 'work',
  description: 'Get Purplets from working at your job.',
  async handle() {
    if (usersOnCooldown.has(this.user.id)) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id)));
    }

    const job: { type: keyof typeof jobs; exp: number } = {
      type: 'DOCTOR',
      exp: 1660,
    };

    if (!job) {
      return this.reply(CRBTError("You don't have a job! To get started, use /job search."));
    }

    const level = getLevelFromExp(job.exp);
    const cooldown = ms(`${jobs[job.type].cooldown[level - 1]}m`);
    const income = jobs[job.type].income[level - 1];
    const expGain = Math.floor(Math.random() * 100) + 100;
    const possibleStrings = jobs[job.type].strings;
    const string = possibleStrings[Math.floor(Math.random() * possibleStrings.length)];

    await this.reply({
      embeds: [
        new MessageEmbed()
          // .setAuthor({
          // name: `You worked as a ${Jobs.TypeNames[job.type].toLowerCase()}...`,
          //   iconURL: icons.success,
          // })
          .setDescription(
            `${string.replace(
              '{purplets}',
              `${emojis.purplet} **${income} Purplets**`
            )}\nYou earned ${expGain} Job XP (${
              Jobs.LevelReqs[level + 1] - job.exp - expGain
            } left to become ${Jobs.LevelNames[level + 1]}).`
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(
          new RemindButton({ relativetime: Date.now() + cooldown, userId: this.user.id })
            .setStyle('SECONDARY')
            .setLabel('Add Reminder')
            .setEmoji(emojis.reminder)
        )
      ),
    });

    usersOnCooldown.set(this.user.id, Date.now() + cooldown);
    setTimeout(() => usersOnCooldown.delete(this.user.id), cooldown);
  },
});
