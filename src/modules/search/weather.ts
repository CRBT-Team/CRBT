import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import convert from 'convert-units';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { fetch } from 'undici';
import { SearchCmdOpts } from './search';
import { createSearchResponse } from './_response';

export async function handleWeather(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const query = opts.query.replace('weather', '').replace('in', '').trim();

  try {
    const locationReq = await fetch(
      `https://nominatim.openstreetmap.org/search.php?q=${query}&format=jsonv2`
    );

    const locationRes: any = await locationReq.json();

    const city = locationRes[0];

    if (!locationReq.ok || !city || !locationRes) {
      return createCRBTError(this, {
        title: t(this, 'SEARCH_ERROR_NO_RESULTS_TITLE'),
        description: t(this, 'SEARCH_ERROR_NO_RESULTS_DESCRIPTION'),
      });
    }

    const weatherReq = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
    );

    const weatherRes: any = await weatherReq.json();

    return createSearchResponse(this, opts, {
      embeds: [
        {
          title: `${city.display_name}`,
          fields: [
            {
              //TODO: localize this
              name: 'Temperature',
              value: `${weatherRes.current_weather.temperature}°C • ${convert(
                weatherRes.current_weather.temperature
              )
                .from('C')
                .to('F')
                .toFixed(1)}°F`,
              inline: true,
            },
            {
              name: 'Wind speed',
              value: `${weatherRes.current_weather.windspeed} Km/h • ${convert(
                weatherRes.current_weather.windspeed
              )
                .from('km/h')
                .to('m/h')
                .toFixed(1)} mph`,
              inline: true,
            },
            {
              name: 'Wind direction',
              value: `${weatherRes.current_weather.winddirection}°`,
              inline: true,
            },
          ],
          footer: {
            text: `${city.licence}\nWeather data by Open-Meteo.com. https://open-meteo.com`,
          },
        },
      ],
    });
  } catch (e) {
    return UnknownError(this, e);
  }
}
