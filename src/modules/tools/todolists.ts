import { db, illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export const add = ChatCommand({
  name: 'todo add',
  description: 'Add an item to your To-Do list.',
  options: new OptionBuilder().string('item', 'The item to add to the todo list', true),
  async handle({ item }) {
    const todolist = await db.misc.upsert({
      where: { id: this.user.id },
      update: {
        todolist: {
          push: item,
        },
      },
      create: {
        id: this.user.id,
        todolist: [item],
      },
    });

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Added to your To-Do List!',
            iconURL: illustrations.success,
          })
          .setDescription(
            `\`\`\`\n${todolist.todolist.map((item, i) => `${i + 1}. ${item}`).join('\n')}\`\`\``
          ),
      ],
    });
  },
});

export const view = ChatCommand({
  name: 'todo view',
  description: 'View your To-Do list.',
  async handle() {
    const todolist = await db.misc.findFirst({
      where: { id: this.user.id },
      select: { todolist: true },
    });

    if (!todolist) {
      return this.reply(CRBTError('You have no To-Do list!'));
    }

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Your To-Do List',
          })
          .setDescription(
            `\`\`\`\n${todolist.todolist.map((item, i) => `${i + 1}. ${item}`).join('\n')}\`\`\``
          ),
      ],
    });
  },
});
