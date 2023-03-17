import { db, icons, jobs } from '$lib/env';
import { row } from '$lib/functions/row';
import { getStrings } from '$lib/language';
import { Jobs } from '@prisma/client';
import { MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components } from 'purplet';

export default ChatCommand({
  name: 'job search',
  description: 'Search for a job to work at.',
  async handle() {
    const { jobs: jobStrings } = getStrings(this.locale).work;

    const randJobs = Object.keys(jobs)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    this.reply({
      embeds: [
        new MessageEmbed().setFields(
          randJobs.map((job) => ({
            name: jobStrings[job].name,
            value: jobStrings[job].description,
          }))
        ),
      ],
      components: components(
        row().addComponents(
          randJobs.map((job) =>
            new ChooseButton(job).setLabel(jobStrings[job].name).setStyle('PRIMARY')
          )
        )
      ),
      ephemeral: true,
    });
  },
});

export const ChooseButton = ButtonComponent({
  async handle(jobID: string) {
    const { jobs: jobStrings } = getStrings(this.locale).work;

    await db.users.upsert({
      where: { id: this.user.id },
      create: { id: this.user.id, job_type: jobID as Jobs },
      update: { job_type: jobID as Jobs },
    });

    await this.update({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `You were hired as a ${jobStrings[jobID].name}!`,
            iconURL: icons.success,
          })
          .setDescription(`You can now start working using the \`/work\` command.`),
      ],
      components: components(),
    });
  },
});
