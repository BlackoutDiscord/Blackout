// Copyright (c) 2023 beryll1um
// Distributed under the Unlicense software license, see
// the accompanying file LICENSE or https://unlicense.org.

import { ChatInputApplicationCommandData, CommandInteraction } from "discord.js";
import { DiscordGuildDispatcher, Guild, DISPATCHER_NOT_INITIALIZED_ERROR } from "@interfaces/DiscordGuildDispatcher";

type DiscordCommand = {
	data: OmitUnion<ChatInputApplicationCommandData, "name">;
	execute: (commandInteraction: CommandInteraction) => Promise<void>;
};

const COMMAND_DISPATCHER_NOT_FOUND_ERROR = "The dispatcher command is not found.";

class DiscordCommandDispatcher implements DiscordGuildDispatcher {
	private _commands: Map<string, Readonly<DiscordCommand>>;
	private _guild?: Guild;

	constructor(commands?: readonly [string, DiscordCommand][]) {
		this._commands = new Map(commands);
	}

	public async attach(guild: Guild): Promise<void> {
		this._guild = guild;
		await this._registerCommands();
	}

	public async detach(): Promise<void> {
		await this._unregisterCommands();
		this._guild = undefined;
	}

	public async set(name: string, command: DiscordCommand): Promise<void> {
		if (this._guild) await this._registerOrEditCommand(name, command.data);
		this._commands.set(name, command);
	}

	public async delete(name: string): Promise<void> {
		if (this._guild) await this._unregisterCommand(name);
		this._commands.delete(name);
	}

	public execute(commandInteraction: CommandInteraction): void {
		const command = this._commands.get(commandInteraction.commandName);
		if (!command) {
			throw new Error(COMMAND_DISPATCHER_NOT_FOUND_ERROR);
		}
		command.execute(commandInteraction);
	}

	private async _registerCommands(): Promise<void> {
		if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
		const commands = Array.from(this._commands.entries()).map(([name, {data}]) => ({ name, ...data }));
		await this._guild.commands.set(commands);
	}

	private async _unregisterCommands(): Promise<void> {
		if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
		await this._guild.commands.set([]);
	}

	private async _registerOrEditCommand(name: string, data: DiscordCommand["data"]): Promise<void> {
		if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
		const fetched = await this._guild.commands.fetch();
		const command = fetched.find(c => c.name === name);
		if (command) {
			await this._guild.commands.edit(command.id, data);
		} else {
			await this._guild.commands.create({ name, ...data });
		}
	}

	private async _unregisterCommand(name: string): Promise<void> {
		if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
		await this._guild.commands.delete(name);
	}
};

export { DiscordCommand, CommandInteraction, DiscordCommandDispatcher };

