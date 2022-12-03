import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updateRoles')
    .setDescription('Updates guild roles.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Updating items...')
    await interaction.client.cache.updateDiscordMembers(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
