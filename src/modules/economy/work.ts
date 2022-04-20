import { Job, LevelNames, LevelReqs } from '$lib/classes/Job';
import { colors, db, emojis, icons } from '$lib/db';
import { CooldownError, CRBTError } from '$lib/functions/CRBTError';
import { getStrings } from '$lib/language';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';

const usersOnCooldown = new Map();

export default ChatCommand({
  name: 'work',
  description: 'Get Purplets from working at your job.',
  async handle() {
    const { jobs: jobStrings } = getStrings(this.locale).work;

    if (usersOnCooldown.has(this.user.id)) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id)));
    }
    const req = await db.users.findFirst({
      where: { id: this.user.id },
      select: { job_type: true, job_exp: true },
    });

    if (!req || !req.job_type) {
      return this.reply(CRBTError("You don't have a job! To get started, use /job search."));
    }

    const job = new Job(req.job_type, req.job_exp);

    const loss = Math.floor(Math.random() * job.maxloss);
    const income = job.income - loss;
    const expGain = Math.floor(Math.random() * 100) + 100;
    const possibleStrings = jobStrings[job.type].strings;
    const string = possibleStrings[Math.floor(Math.random() * possibleStrings.length)];

    await db.users.update({
      where: { id: this.user.id },
      data: {
        job_exp: { increment: expGain },
      },
    });
    await db.profiles.upsert({
      where: { id: this.user.id },
      create: { id: this.user.id, purplets: income },
      update: { purplets: { increment: income } },
    });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `You worked as a ${jobStrings[job.type].name.toLowerCase()}...`,
            iconURL: icons.success,
          })
          .setDescription(
            `${string.replace(
              '<PURPLETS>',
              `${emojis.purplet} **${income} Purplets**`
            )}\nYou earned ${expGain} Job XP (${
              LevelReqs[job.level + 1] - job.exp - expGain
            } left to become ${LevelNames[job.level + 1]}).`
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(
          new RemindButton({
            relativetime: Date.now() + job.cooldown,
            userId: this.user.id,
            locale: this.locale,
          })
            .setStyle('SECONDARY')
            .setLabel('Add Reminder')
            .setEmoji(emojis.reminder)
        )
      ),
    });

    usersOnCooldown.set(this.user.id, Date.now() + job.cooldown);
    setTimeout(() => usersOnCooldown.delete(this.user.id), job.cooldown);
  },
});
