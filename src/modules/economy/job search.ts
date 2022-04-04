import { Job } from '$lib/classes/Job';
import { jobs } from '$lib/db';
import { row } from '$lib/functions/row';
import { MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components } from 'purplet';

export default ChatCommand({
  name: 'job search',
  description: 'Search for a job to work at.',
  async handle() {
    const randJobs = Object.keys(jobs)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((job) => new Job(job));

    this.reply({
      embeds: [
        new MessageEmbed().setFields(
          randJobs.map((job) => ({
            name: job.name,
            value: job.description,
          }))
        ),
      ],
      components: components(
        row().addComponents(
          randJobs.map((job) => new ChooseButton(job.id).setLabel(job.name).setStyle('PRIMARY'))
        )
      ),
    });
  },
});

export const ChooseButton = ButtonComponent({
  handle(jobType: string) {
    const job = new Job(jobType);
  },
});
