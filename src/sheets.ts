import Google from './google.js'
import { ChannelType, Client, User } from 'discord.js'
import type { Donations, Member } from './types.js'

export default class Sheet extends Google {
  async updateInventory (client: Client): Promise<void> {
    const inventory: string[][] = []
    if (client.cache.guild === undefined) return
    for (const item of client.cache.items) {
      if ((item.donator === true) || (item.donate === true) || ['Dummy item', 'Dummy Item 2', 'Dummy Item 3'].includes(item.name)) continue
      const sellablePrice = !item.sellable || item.sell === undefined ? 'N/A' : item.sell.toString()
      const cost = item.cost === -1 || (item.cost === 0) ? 'N/A' : item.cost.toString()
      const amount = item.id in client.cache.guild.uinv ? client.cache.guild.uinv[item.id].toString() : '0'
      inventory.push([item.name, item.level.toString(), cost, sellablePrice, amount])
    }
    await this.updateSpreadSheetValue(client, 'Gold Sheet!E2', 'ROWS', [[client.cache.guild.gold.toString()]], false)
    await this.updateSpreadSheetValue(client, 'Item Sheet!I6:M', 'ROWS', inventory, true)
  }

  async updateGuildInfo (client: Client): Promise<void> {
    const donators = await this.gatherSpreadSheetValue(client, 'Gold Deposit Form!B2:D', 'ROWS')
    if (donators === undefined || donators === null) return
    const donations: Donations = {}
    for (const donator of donators) {
      const [name, amount, id]: string[] = donator
      if (id in donations) donations[id].donated += parseInt(amount)
      else donations[id] = { donated: parseInt(amount), name }
    }
    const donatorUsers: Array<Promise<User>> = Object.entries(donations)
      .filter(([_, donation]) => donation.donated > 0)
      .map(async ([donatorId]) => await client.users.fetch(donatorId))
    for (const donatorUser of await Promise.allSettled(donatorUsers)) {
      if (donatorUser.status !== 'fulfilled') continue
      donations[donatorUser.value.id].name = donatorUser.value.username
    }
    const sortedDonations = Object.entries(donations).sort((a, b) => b[1].donated - a[1].donated)
    const donatorIds = []
    const donatorNamesAndDonatedAmount = []
    for (const donation of sortedDonations) {
      donatorIds.push(donation[0])
      donatorNamesAndDonatedAmount.push([donation[1].name, donation[1].donated.toString()])
    }
    await this.updateSpreadSheetValue(client, 'Gold Sheet!D6:D', 'ROWS', [donatorIds], true)
    await this.updateSpreadSheetValue(client, 'Gold Sheet!A6:B', 'ROWS', donatorNamesAndDonatedAmount, true)
  }

  async updateMembers (client: Client): Promise<void> {
    const owners: Member[] = []; const elders: Member[] = []; const members: Member[] = []
    for (const member of client.cache.guildMembers.values()) {
      if (member.id === client.cache.guild?.owner) owners.push(member)
      else if ((client.cache.guild?.elder.includes(member.id)) === true) elders.push(member)
      else if ((client.cache.guild?.members.includes(member.id)) === true) members.push(member)
    }
    const guildMembers: Member[] = owners.concat(elders, members)
    const notInDiscordGuildMembers = guildMembers.filter(member => !client.cache.discordMembers.includes(member.id))
    const missingMemberChannel = await client.guilds.resolve(client.env.DISCORD_GUILD_ID)?.channels.resolve(client.env.DISCORD_MISSING_MEMBERS_CHANNEL_ID)
    if (missingMemberChannel !== null && missingMemberChannel !== undefined && missingMemberChannel.type === ChannelType.GuildText) {
      await missingMemberChannel.bulkDelete(100)
      for (const member of notInDiscordGuildMembers) {
        try {
          const user = await client.users.fetch(member.id)
          await missingMemberChannel.send(`\`${user.username}#${user.discriminator}\` && USER ID : \`${user.id}\` => <@${user.id}>`)
        } catch {
          await missingMemberChannel.send(`USER ID : \`${member.id}\` => <@${member.id}>`)
        }
      }
    }
    await this.updateSpreadSheetValue(client, 'Members!G10:I', 'ROWS', notInDiscordGuildMembers.map(member => [member.name, member.id, member.level.toString()]), true)
    await this.updateSpreadSheetValue(client, 'Members!F1:F', 'ROWS', [[owners.length.toString()], [elders.length.toString()], [members.length.toString()]], false)
    await this.callAppsScript(client)
    await this.updateSpreadSheetValue(client, 'Members!B10:E', 'ROWS', guildMembers.map(member => [member.name, member.id, member.level.toString(), member.gold.toString()]), true)
  }

  async reportRequest (client: Client, username: string, id: string, item: string, quantity: number): Promise<void> {
    if (item === 'gold') {
      await this.shiftSpreadsheetValues(client, 118055431, [1, 2], [0, 4])
      await this.updateSpreadSheetValue(client, 'Gold Deposit Form!A2:D2', 'ROWS', [[
        new Date(Date.now()).toUTCString(),
        username,
        quantity.toString(),
        id
      ]], false)
    } else {
      await this.shiftSpreadsheetValues(client, 1306100818, [5, 6], [1, 8])
      await this.updateSpreadSheetValue(client, 'Item Sheet!B6:G6', 'ROWS', [[
        username,
        id,
        item,
        (quantity > 0 ? quantity : 0).toString(),
        (quantity < 0 ? quantity : 0).toString(),
        new Date(Date.now()).toUTCString()
      ]], false)
    }
  }

  async addRequest (client: Client, time: Date, username: string, itemtype: string, number: number): Promise<void> {
    await this.shiftSpreadsheetValues(client, 95601, [1, 2], [0, 4])
    await this.updateSpreadSheetValue(client, 'Requests!I1', 'ROWS', [['1']], false)
    await this.updateSpreadSheetValue(client, 'Requests!A2:D2', 'ROWS', [[time.toUTCString(), username, itemtype, number.toString()]], false)
    await this.callAppsScript(client)
    const requestChannel = await client.guilds.resolve(client.env.DISCORD_GUILD_ID)?.channels.resolve(client.env.DISCORD_REQUEST_CHANNEL_ID)
    if (requestChannel !== null && requestChannel !== undefined && requestChannel.type === ChannelType.GuildText) {
      await requestChannel.send(`${username} requested ${itemtype === 'gold' ? number.toLocaleString() : number} ${itemtype} at ${time.toUTCString()}`)
    }
  }
}
