import { imgDominantColor } from '$lib/functions/imgDominantColor';
import { OnEvent } from 'purplet';
import { getSettings, saveServerSettings } from '../settings/serverSettings/_helpers';

export default OnEvent('guildUpdate', async (oldGuild, newGuild) => {
  if (oldGuild.icon === newGuild.icon) return;

  const { automaticTheming } = await getSettings(newGuild.id);

  if (!automaticTheming) return;

  const guildIcon = newGuild.iconURL({ format: 'png' });
  const dominantColor = (await imgDominantColor(guildIcon)).num();

  await saveServerSettings(newGuild.id, {
    iconHash: newGuild.icon,
    accentColor: dominantColor,
  });
});
