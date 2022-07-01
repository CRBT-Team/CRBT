import { CRBTError } from '$lib/functions/CRBTError';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { t } from '$lib/language';
import { ImageUrlRegex, UrlRegex } from '$lib/util/regex';
import { GuildMember } from 'discord.js';
import { ModalComponent } from 'purplet';
import { joinBuilderCache, renderJoinLeaveBuilder } from '../renderers';

export const AuthorEditModal = ModalComponent({
  async handle(ctx: null) {
    const name = this.fields.getTextInputValue('AUTHOR_NAME');
    const icon = this.fields.getTextInputValue('AUTHOR_ICON');
    const url = this.fields.getTextInputValue('AUTHOR_URL');

    const data = joinBuilderCache.get(this.guildId);

    const parsedIcon = icon
      ? parseCRBTscript(icon, {
          channel: this.channel,
          member: this.member as GuildMember,
        })
      : null;

    if (parsedIcon && !parsedIcon.match(ImageUrlRegex)) {
      console.log('bad icon');
      return this.reply(CRBTError(t(this, 'ERROR_INVALID_URL')));
    }
    if (url && !url.match(UrlRegex)) {
      return this.reply(CRBTError(t(this, 'ERROR_INVALID_URL')));
    }

    data.embed = {
      ...data.embed,
      author: {
        name,
        icon_url: icon,
        url,
      },
    };

    await this.update(await renderJoinLeaveBuilder.call(this, 'JOIN_MESSAGE', data));
  },
});
