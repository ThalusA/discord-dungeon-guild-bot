import fs from 'node:fs/promises'
import slowFs from 'node:fs'
import path from 'node:path'
import { Client, Collection } from 'discord.js'
import { Guild, Item, Member, Role } from './types'

export default class DiscordDungeonCache {
  private _guild: Guild | undefined
  private _guildMembers: Collection<string, Member>
  private _items: Item[]
  private _discordMembers: string[]

  constructor () {
    try {
      this._guild = JSON.parse(slowFs.readFileSync(path.join('cache', 'guild.json')).toString())
    } catch {
      this._guild = undefined
    }
    try {
      this._guildMembers = JSON.parse(slowFs.readFileSync(path.join('cache', 'guildMembers.json')).toString())
    } catch {
      this._guildMembers = new Collection<string, Member>()
    }
    try {
      this._items = JSON.parse(slowFs.readFileSync(path.join('cache', 'items.json')).toString())
    } catch {
      this._items = []
    }
    try {
      this._discordMembers = JSON.parse(slowFs.readFileSync(path.join('cache', 'discordMembers.json')).toString())
    } catch {
      this._discordMembers = []
    }
  }

  get guild (): Guild | undefined {
    return this._guild
  }

  set guild (guild) {
    if (guild === undefined) {
      throw new Error('Guild can not be set to undefined.')
    }
    this._guild = guild
  }

  get guildMembers (): Collection<string, Member> {
    return this._guildMembers
  }

  set guildMembers (guildMembers) {
    this._guildMembers = guildMembers
  }

  get items (): Item[] {
    return this._items
  }

  set items (items) {
    this._items = items
  }

  get discordMembers (): string[] {
    return this._discordMembers
  }

  set discordMembers (discordMembers) {
    this._discordMembers = discordMembers
  }

  async updateGuild (client: Client): Promise<void> {
    const response = await fetch(`https://api.discorddungeons.me/v3/guild/${client.env.DISCORD_DUNGEONS_GUILD_ID}`, {
      headers: { Authorization: client.env.DISCORD_DUNGEONS_API_KEY }
    })
    const json = await response.json()
    this.guild = json.data
    await fs.writeFile(path.join('cache', 'guild.json'), JSON.stringify(this.guild))
  }

  async updateGuildMembers (client: Client): Promise<void> {
    if (this.guild === undefined) {
      throw new Error('Guild is undefined.')
    }
    const response = await fetch(`https://api.discorddungeons.me/v3/bulk/user/${this.guild.members.join(',')}`, {
      headers: { Authorization: client.env.DISCORD_DUNGEONS_API_KEY }
    })
    const json = await response.json()
    const members: Member[] = json.data
    const memberCollection = new Collection<string, Member>()
    for (const member of members) {
      memberCollection.set(member.name, member)
    }
    this.guildMembers = memberCollection
    await fs.writeFile(path.join('cache', 'guildMembers.json'), JSON.stringify(this.guildMembers))
  }

  async updateItems (client: Client): Promise<void> {
    const response = await fetch('https://api.discorddungeons.me/v3/all/items', {
      headers: { Authorization: client.env.DISCORD_DUNGEONS_API_KEY }
    })
    const json = await response.json()
    this.items = json.data
    await fs.writeFile(path.join('cache', 'items.json'), JSON.stringify(this.items))
  }

  async updateDiscordMembers (client: Client): Promise<void> {
    const members = await client.guilds.resolve(client.env.DISCORD_GUILD_ID)?.members.fetch()
    if (members === undefined) {
      throw new Error('Members is undefined.')
    }
    if (this.guild === undefined) {
      throw new Error('Guild is undefined.')
    }
    const discordMembers = []
    const unknownDiscordMembers = []
    for (const member of members.values()) {
      if (member.user.bot) continue
      discordMembers.push(member.user.id)
      if (this.guild.elder.includes(member.user.id) || this.guild.owner === member.user.id) {
        if (member.roles.cache.has(client.env.DISCORD_ELDER_ROLE_ID)) await member.roles.add(client.env.DISCORD_ELDER_ROLE_ID)
      } else if (member.roles.cache.has(client.env.DISCORD_ELDER_ROLE_ID)) {
        await member.roles.remove(client.env.DISCORD_ELDER_ROLE_ID)
      }
      if (this.guild.members.includes(member.user.id)) {
        if (!member.roles.cache.has(client.env.DISCORD_MEMBER_ROLE_ID)) await member.roles.add(client.env.DISCORD_MEMBER_ROLE_ID)
        if (member.roles.cache.has(client.env.DISCORD_NO_GUILD_ROLE_ID)) await member.roles.remove(client.env.DISCORD_NO_GUILD_ROLE_ID)
        if (member.roles.cache.has(client.env.DISCORD_ALLIED_GUILD_ROLE_ID)) await member.roles.remove(client.env.DISCORD_ALLIED_GUILD_ROLE_ID)
        if (member.roles.cache.has(client.env.DISCORD_OTHER_GUILD_ROLE_ID)) await member.roles.remove(client.env.DISCORD_OTHER_GUILD_ROLE_ID)
      } else {
        if (member.roles.cache.has(client.env.DISCORD_MEMBER_ROLE_ID)) await member.roles.remove(client.env.DISCORD_MEMBER_ROLE_ID)
        unknownDiscordMembers.push(member.user.id)
      }
    }
    if (unknownDiscordMembers.length > 0) {
      const response = await fetch(`https://api.discorddungeons.me/v3/bulk/user/${unknownDiscordMembers.join(',')}`, {
        headers: { Authorization: client.env.DISCORD_DUNGEONS_API_KEY }
      })
      const json = await response.json()
      const unknownDiscordMemberList: Member[] = json.data
      for (const unknownDiscordMember of unknownDiscordMemberList) {
        const member = client.guilds.resolve(client.env.DISCORD_GUILD_ID)?.members.resolve(unknownDiscordMember.id)
        if (member === undefined || member === null) continue
        if (unknownDiscordMember.guild === '') await member.roles.add(client.env.DISCORD_NO_GUILD_ROLE_ID)
        else if (member.roles.cache.has(client.env.DISCORD_ALLIED_GUILD_ROLE_ID)) await member.roles.remove(client.env.DISCORD_NO_GUILD_ROLE_ID)
        if (this.guild.allies.includes(unknownDiscordMember.guild)) await member.roles.add(client.env.DISCORD_ALLIED_GUILD_ROLE_ID)
        else {
          if (member.roles.cache.has(client.env.DISCORD_ALLIED_GUILD_ROLE_ID)) await member.roles.remove(client.env.DISCORD_ALLIED_GUILD_ROLE_ID)
          if (unknownDiscordMember.guild !== '' && unknownDiscordMember.guild !== this.guild.id) await member.roles.add(client.env.DISCORD_OTHER_GUILD_ROLE_ID)
          else if (member.roles.cache.has(client.env.DISCORD_OTHER_GUILD_ROLE_ID)) await member.roles.remove(client.env.DISCORD_OTHER_GUILD_ROLE_ID)
        }
        if (await fs.access('extraRoles.json', fs.constants.F_OK).then(() => true).catch(() => false)) {
          const extraRoles: Role[] = JSON.parse((await fs.readFile('extraRoles.json')).toString())
          for (const role of extraRoles) {
            if (unknownDiscordMember.guild === role.guildId) await member.roles.add(role.roleId)
            else if (member.roles.cache.has(role.roleId)) await member.roles.remove(role.roleId)
          }
        }
      }
    }
    this.discordMembers = discordMembers
    await fs.writeFile(path.join('cache', 'discordMembers.json'), JSON.stringify(this.discordMembers))
  }
}
