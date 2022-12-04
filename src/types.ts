import { ChatInputCommandInteraction, Client, Message, SlashCommandBuilder } from 'discord.js'

export interface InternalCommand {
  data: SlashCommandBuilder
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}
export interface ExternalCommand {
  keyword: string
  execute: (interaction: { client: Client, message: Message }) => Promise<void>
}

export interface Member {
  name: string
  id: string
  level: number
  gold: number
  guild: string
}

export interface Guild {
  id: string
  uinv: Record<string, number>
  gold: number
  elder: string[]
  members: string[]
  owner: string
  allies: string
}

export interface Item {
  cost: number
  desc: string
  image: string
  level: number
  name: string
  id: string
  plural: string
  prefix: string
  sell: number
  sellable: boolean
  tradable: boolean
  type: string
  donator?: boolean
  donate?: boolean
}

export interface Role {
  guildId: string
  roleId: string
}

export interface Donation {
  donated: number
  name: string
}

export interface Donations {
  [key: string]: Donation
}

export enum InfoType {
  User,
  Amount,
  Item
}

export interface Environment {
  DISCORD_TOKEN: string
  WEBSITE_URL: string
  GOOGLE_SPREADSHEET_URL: string
  GOOGLE_SCRIPT_ID: string
  GOOGLE_SPREADSHEET_ID: string
  GOOGLE_API_KEY: string
  DISCORD_GUILD_ID: string
  DISCORD_MISSING_MEMBERS_CHANNEL_ID: string
  DISCORD_REQUEST_CHANNEL_ID: string
  DISCORD_DUNGEONS_BOT_ID: string
  DISCORD_DUNGEONS_GUILD_ID: string
  DISCORD_DUNGEONS_API_KEY: string
  DISCORD_MEMBER_ROLE_ID: string
  DISCORD_ELDER_ROLE_ID: string
  DISCORD_NO_GUILD_ROLE_ID: string
  DISCORD_ALLIED_GUILD_ROLE_ID: string
  DISCORD_OTHER_GUILD_ROLE_ID: string
  DISCORD_IRON_ROLE_ID: string
}
