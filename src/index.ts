// Copyright (c) 2023 beryll1um
// Distributed under the Unlicense software license, see
// the accompanying file LICENSE or https://unlicense.org.

import { Client, GatewayIntentBits, Interaction } from "discord.js";
import {
  CommandInteraction,
  DiscordCommandDispatcher,
} from "@dispatchers/DiscordCommandDispatcher";
import {
  DiscordChannelType,
  DiscordChannelDispatcher,
} from "@dispatchers/DiscordChannelDispatcher";

const commandDispatcher = new DiscordCommandDispatcher([
  [
    "ping",
    {
      data: {
        description: "Reply Pong!",
      },
      execute: async (commandInteraction: CommandInteraction) => {
        commandInteraction.reply("Pong!");
      },
    },
  ],
]);

const channelDispatcher = new DiscordChannelDispatcher({
  templates: [
    {
      name: "Global",
      type: DiscordChannelType.GuildCategory,
    },
    {
      name: "Text",
      parent: "Global",
      type: DiscordChannelType.GuildText,
      topic: "For text communication",
    },
  ],
  temporary: true,
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const stopBot = async () => {
  await commandDispatcher.detach();
  await channelDispatcher.detach();
  client.destroy();
  console.log("Bot stopped.");
  process.exit();
};
process.on("SIGTERM", stopBot);
process.on("SIGINT", stopBot);

client.on("ready", async () => {
  console.log("Bot started.");
  const guild = client.guilds.resolve(process.env.DISCORD_SERVER_ID as string);
  if (!guild) {
    console.error("Bot cannot resolve your server!");
    stopBot();
    return;
  }
  await commandDispatcher.attach(guild);
  await channelDispatcher.attach(guild);
  const channel = await channelDispatcher.create({
    name: "Voice",
    parent: "Global",
    type: DiscordChannelType.GuildVoice,
    userLimit: 10,
  });
  setTimeout(() => {
    channelDispatcher.delete(channel.id);
  }, 5000);
});

client.on("interactionCreate", (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  commandDispatcher.execute(interaction);
});

client.login();
