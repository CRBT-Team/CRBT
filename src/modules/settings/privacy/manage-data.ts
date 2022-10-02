import { colors, db, icons } from "$lib/db";
import { ReminderData } from "$lib/types/timeouts";
import { TimeoutTypes } from "@prisma/client";
import { MessageFlags } from "discord-api-types/v10";
import { MessageAttachment, MessageEmbed } from "discord.js";
import { ButtonComponent, components, row } from "purplet";

export const ExportAllData = ButtonComponent({
  async handle() {
    const userData = await db.users.findFirst({ where: { id: this.user.id }, include: { achievements: true } });
    const reminders = (await db.timeouts.findMany({ where: { type: TimeoutTypes.REMINDER, } }) as ReminderData[]).filter((r) => r.data.userId === this.user.id);

    await this.reply({
      files: [
        new MessageAttachment(Buffer.from(JSON.stringify({ ...userData, reminders }, null, 2)))
          .setName('data.json')
      ],
      flags: MessageFlags.Ephemeral
    })
  }
});

export const ConfirmDataDeletion = ButtonComponent({
  async handle() {
    this.reply({
      embeds: [
        {
          author: {
            name: 'Are you sure that you want all of your data deleted forever?'
          },
          description:
            'This includes the **entirety** of your reminders, your privacy settings, your achievements, your badges, **your CRBT+ subscription info** (__you can\'t recover this!__), and your other settings.\nIt will be gone, **FOREVER**!',
          color: `#${colors.red}`
        }
      ],
      components: components(
        row(
          new DeleteAllData().setLabel("Yes, delete it all!").setStyle('DANGER'),
          new CancelButton().setLabel('Nevermind').setStyle('SECONDARY')
        )
      ),
      ephemeral: true,
    })

  }
});

export const CancelButton = ButtonComponent({
  async handle() {
    this.update({
      embeds: [
        {
          author: {
            name: 'Operation cancelled.',
            iconURL: icons.information
          },
          color: `#${colors.gray}`
        }
      ],
      components: []
    })
  }
})

export const DeleteAllData = ButtonComponent({
  async handle() {
    await db.users.delete({
      where: { id: this.user.id },
      include: {
        achievements: true,
      }
    });
    const reminders = (await db.timeouts.findMany({ where: { type: TimeoutTypes.REMINDER, } }) as ReminderData[]).filter((r) => r.data.userId === this.user.id);

    reminders.forEach((r) => db.timeouts.delete({ where: { id: r.id } }));

    await this.update({
      embeds: [
        {
          author: {
            name: 'All of your CRBT data has successfully been deleted.',
            iconURL: icons.success
          },
          color: `#${colors.success}`
        }
      ],
      components: []
    })

  }
})