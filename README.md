![CRBT](/.assets/readme-banner.png)

# CRBT

The perfect just-about-anything Discord bot.

[![Discord](https://img.shields.io/discord/995533040040292373?color=F27187&label=discord&logo=discord&logoColor=white)](https://discord.gg/AvwhNtsgAC)
![License](https://img.shields.io/github/license/CRBT-Team/CRBT?color=F27187)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/CRBT-Team/CRBT?color=F27187)
[![Issues](https://img.shields.io/github/issues/CRBT-Team/CRBT)](https://github.com/CRBT-Team/CRBT/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/CRBT-Team/CRBT)](https://github.com/CRBT-Team/CRBT/pulls) [![Crowdin](https://badges.crowdin.net/crbt/localized.svg)](https://crowdin.com/project/crbt)

### Tech stack

- [Purplet](https://purplet.js.org) (v1), our custom-built Discord bot framework.
- [Discord.js](https://discord.js.org), though we're moving away from it in Purplet v2.
- [Supabase](https://supabase.com) for the database
- [Prisma](https://prisma.io) for interacting with the database

### Installation

1. Clone with `git clone https://github.com/CRBT-Team/CRBT`
2. Install dependencies with `pnpm install`
3. Run `pnpm dev` to run it locally
4. Run `pnpm build` to build a production-ready bot

### Project Structure

- `/static` contains JSON files and other assets used in the bot
- `/disabled` contains deprecated or cancelled features, put on hold in case I bring them back
- `/src/lib` is for custom functions, constants, and components used throughout the bot
- `/src/modules` is where Purplet modules are contained, and where commands & components are exported. Each directory within maps to a CRBT feature.

### Acknowledgements

- [paperdave](https://github.com/paperdave) for coding the large majority of Purplet and helping with the early code.
