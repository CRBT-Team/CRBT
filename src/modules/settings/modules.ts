import { colors, db, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { Modules } from '@prisma/client';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

const choices = {
  JOIN_MESSAGE: 'Welcome messages',
  LEAVE_MESSAGE: 'Farewell messages',
};

export default ChatCommand({
  name: 'module enable',
  description: 'Choose a module to enable.',
  options: new OptionBuilder().string('module', 'The module to enable.', {
    choices,
    required: true,
  }),
  async handle({ module }) {
    let mod = module as Modules;

    const data = await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { modules: true },
    });

    if (data?.modules.includes(mod)) {
      return this.reply(CRBTError(`The module "${choices[module]}" is already enabled.`));
    }

    await db.servers.upsert({
      where: { id: this.guild.id },
      create: {
        id: this.guild.id,
        modules: { set: [mod] },
      },
      update: {
        modules: {
          push: mod,
        },
      },
    });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `CRBT Settings - ${choices[module]} Enabled`,
            iconURL: icons.success,
          })
          .setColor(`#${colors.success}`),
      ],
    });
  },
});

export const disable = ChatCommand({
  name: 'module disable',
  description: 'Choose a module to disable.',
  options: new OptionBuilder().string('module', 'The module to disable.', {
    choices,
    required: true,
  }),
  async handle({ module }) {
    let mod = module as Modules;

    const data = await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { modules: true },
    });

    if (!data || !data.modules.includes(mod)) {
      return this.reply(CRBTError(`The module "${choices[module]}" is already disabled.`));
    }

    const newData = data.modules.filter((m) => m !== mod);

    await db.servers.upsert({
      where: { id: this.guild.id },
      create: {
        id: this.guild.id,
        modules: { set: newData },
      },
      update: {
        modules: {
          set: newData,
        },
      },
    });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `CRBT Settings - ${choices[module]} Disabled`,
            iconURL: icons.success,
          })
          .setColor(`#${colors.success}`),
      ],
    });
  },
});
