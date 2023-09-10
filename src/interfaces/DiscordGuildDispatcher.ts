// Copyright (c) 2023 beryll1um
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

import { Guild } from "discord.js";

interface DiscordGuildDispatcher {
  attach(guild: Guild): void;
  detach(): void;
}

const DISPATCHER_NOT_INITIALIZED_ERROR = "The dispatcher is not initialized.";

export { DiscordGuildDispatcher, Guild, DISPATCHER_NOT_INITIALIZED_ERROR };
