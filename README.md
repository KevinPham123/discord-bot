# Discord Bot Starter

This project creates a simple Discord bot using Node.js and discord.js.

## Setup

1. Install dependencies:
   npm install
2. Copy `.env.example` to `.env` and add your Discord bot token.
3. Start the bot:
   npm start

## Commands

- `!ping` — responds with `Pong!`
- `!help` — shows supported commands

## Create a Discord bot token

1. Go to https://discord.com/developers/applications
2. Click `New Application`
3. Open the `Bot` section
4. Click `Reset Token` and copy it
5. Paste it into your `.env` file as `DISCORD_TOKEN`
6. Invite the bot to your server using the OAuth2 URL generator

## Useful notes

Make sure the bot has the `Message Content` intent enabled in the Discord Developer Portal.
