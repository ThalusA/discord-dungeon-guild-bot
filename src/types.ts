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
