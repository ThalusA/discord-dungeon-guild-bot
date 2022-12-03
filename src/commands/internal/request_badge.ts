import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('requestBadge')
    .setDescription('Request the Nova badge'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const member = interaction.client.cache.guildMembers.get(interaction.user.username)
    const guild = await interaction.client.guilds.resolve(interaction.client.env.DISCORD_GUILD_ID)
    if (guild === null) {
      return
    }
    const guildMember = guild.members.resolve(interaction.user.id)
    if (member === undefined || guildMember === null) {
      await interaction.reply('You must be a member of Nova to request a Nova Badge')
    } else if (Date.now() - (guildMember.joinedTimestamp ?? 0) >= 604800000 && member.level >= 20 && guildMember.roles.valueOf().has(interaction.client.env.DISCORD_IRON_ROLE_ID)) {
      await interaction.reply('You have requested a Nova Badge')
      const requestChannel = await interaction.client.guilds.resolve(interaction.client.env.DISCORD_GUILD_ID)?.channels.resolve(interaction.client.env.DISCORD_REQUEST_CHANNEL_ID)
      if (requestChannel !== undefined && requestChannel !== null && requestChannel.type === ChannelType.GuildText) {
        await requestChannel.send(`${interaction.user.username} requested the Nova badge at ${new Date(interaction.createdTimestamp).toUTCString()}`)
      }
    } else {
      await interaction.reply('You do not meet the requirements for a Nova Badge')
    }

    await interaction.reply('You just requested : the Nova badge')
  }
}

export default command
