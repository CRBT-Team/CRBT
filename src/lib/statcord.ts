import { Client } from 'discord.js';
import 'dotenv/config';
import { Client as Statcord } from 'statcord.js';

export let statcord: Statcord;

export function initStatcord(client: Client) {
  const statclient = new Statcord({
    client,
    key: process.env.STATCORD_KEY,
  });

  statcord = statclient;

  return statclient;
}
