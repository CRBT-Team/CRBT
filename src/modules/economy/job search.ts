import { jobs } from '$lib/db';
import { Jobs } from '$lib/util/Jobs';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'job search',
  description: 'Search for a job to work at.',
  async handle() {
    const randJobs = Object.keys(jobs)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    this.reply({
      embeds: [
        new MessageEmbed().setFields(
          randJobs.map((job) => ({
            name: job,
            value: Jobs.TypeDescriptions[job],
          }))
        ),
      ],
    });
  },
});
