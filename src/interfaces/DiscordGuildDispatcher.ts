// Copyright (c) 2023 beryll1um
// Distributed under the Unlicense software license, see
// the accompanying file LICENSE or https://unlicense.org.

import { Guild } from "discord.js";

interface DiscordGuildDispatcher {
	attach(guild: Guild): void;
	detach(): void;
};

const DISPATCHER_NOT_INITIALIZED_ERROR = "The dispatcher is not initialized.";

export { DiscordGuildDispatcher, Guild, DISPATCHER_NOT_INITIALIZED_ERROR };

