// Copyright (c) 2023 beryll1um
// Distributed under the Unlicense software license, see
// the accompanying file LICENSE or https://unlicense.org.

import { Client, GatewayIntentBits, Interaction } from "discord.js";
import { CommandInteraction, DiscordCommandDispatcher } from "@dispatchers/DiscordCommandDispatcher";

const commandDispatcher = new DiscordCommandDispatcher([
	[
		"ping",
		{
			data: {
				description: "Reply Pong!"
			},
			execute: async (commandInteraction: CommandInteraction) => {
				commandInteraction.reply("Pong!");
			}
		}
	]
]);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const stopBot = async () => {
	await commandDispatcher.detach();
	client.destroy();
	console.log("Bot stopped.");
	process.exit();
}
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
	commandDispatcher.attach(guild);
});

client.on("interactionCreate", (interaction: Interaction) => {
	if (!interaction.isCommand()) return;
	commandDispatcher.execute(interaction);
});

client.login();

