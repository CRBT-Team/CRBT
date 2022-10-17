import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { SearchCmdOpts } from './search';
import { createSearchResponse } from './_response';

export async function handleWeather(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const query = opts.query.replace('weather', '').replace('in', '').trim();
  console.log(opts);

  const locationReq = await fetch(
    `https://nominatim.openstreetmap.org/search.php?q=${query}&format=jsonv2`
  );

  const locationRes: any = await locationReq.json();

  const city = locationRes[0];

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
            name: 'Temperature',
            value: weatherRes.current_weather.temperature.toString(),
            inline: true,
          },
          {
            name: 'Wind speed',
            value: weatherRes.current_weather.windspeed.toString(),
            inline: true,
          },
          {
            name: 'Wind direction',
            value: weatherRes.current_weather.winddirection.toString(),
            inline: true,
          },
        ],
        footer: {
          text: `${city.licence}\nWeather data by Open-Meteo.com. https://open-meteo.com`,
        },
      },
    ],
  });
}
