// Copyright (c) 2023 beryll1um
// Distributed under the Unlicense software license, see
// the accompanying file LICENSE or https://unlicense.org.

import {
  ChannelType as DiscordChannelType,
  GuildChannelCreateOptions,
  GuildChannel,
  Snowflake,
} from "discord.js";
import {
  DiscordGuildDispatcher,
  Guild,
  DISPATCHER_NOT_INITIALIZED_ERROR,
} from "@interfaces/DiscordGuildDispatcher";

type GuildChannelId = GuildChannel["id"];
type GuildChannelWithoutId = OmitUnion<GuildChannel, "id">;

type DiscordChannelCreateOptions = Omit<GuildChannelCreateOptions, "parent"> & {
  parent?: string;
};

type DiscordChannelDispatcherOptions = {
  templates?: readonly DiscordChannelCreateOptions[];
  temporary?: boolean;
};

type DiscordChannel = Readonly<
  Pick<GuildChannel, "id" | "name" | "type"> & {
    parent: DiscordChannel | null;
  }
>;

type DiscordChannelId = DiscordChannel["id"];

const CHANNEL_DISPATCHER_NOT_FOUND_ERROR =
  "The dispatcher channel is not found.";

class DiscordChannelDispatcher implements DiscordGuildDispatcher {
  private _options?: DiscordChannelDispatcherOptions;
  private _channels: Map<GuildChannelId, GuildChannelWithoutId> = new Map();
  private _guild?: Guild;

  constructor(options?: DiscordChannelDispatcherOptions) {
    this._options = options;
  }

  public async attach(guild: Guild): Promise<void> {
    this._guild = guild;
    await this._createChannels();
  }

  public async detach(): Promise<void> {
    if (this._options?.temporary) await this._deleteChannels();
    this._guild = undefined;
  }

  public async create(
    template: DiscordChannelCreateOptions
  ): Promise<DiscordChannel> {
    if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
    let parent: Snowflake | undefined;
    if (template.parent) {
      parent = this._guild.channels.cache.find((channel) => {
        return (
          channel.type === DiscordChannelType.GuildCategory &&
          channel.name === template.parent
        );
      })?.id;
    }
    const channel = await this._guild.channels.create({ ...template, parent });
    this._channels.set(channel.id, channel);
    return channel;
  }

  public async delete(id: DiscordChannelId): Promise<void> {
    if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
    const channel = this._channels.get(id);
    if (!channel) throw new Error(CHANNEL_DISPATCHER_NOT_FOUND_ERROR);
    this._channels.delete(id);
    await channel.delete();
  }

  public channels(): DiscordChannel[] {
    return [...this._channels.entries()].map(([id, data]) => ({ id, ...data }));
  }

  private async _createChannels(): Promise<void> {
    if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
    const templates = this._options?.templates;
    if (!templates) return;
    const [categories, remaining]: [
      DiscordChannelCreateOptions[],
      DiscordChannelCreateOptions[]
    ] = [[], []];
    for (const template of templates) {
      if (template.type === DiscordChannelType.GuildCategory) {
        categories.push(template);
      } else {
        remaining.push(template);
      }
    }
    await Promise.all(categories.map((category) => this.create(category)));
    await Promise.all(remaining.map((remaining) => this.create(remaining)));
  }

  private async _deleteChannels(): Promise<void> {
    if (!this._guild) throw new Error(DISPATCHER_NOT_INITIALIZED_ERROR);
    await Promise.all([...this._channels.keys()].map((id) => this.delete(id)));
  }
}

export {
  DiscordChannelType,
  Guild,
  DiscordChannelCreateOptions,
  DiscordChannelDispatcherOptions,
  DiscordChannel,
  DiscordChannelId,
  DiscordChannelDispatcher,
};
