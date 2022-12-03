import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updateMembers')
    .setDescription('Updates the list of members in the guild.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Updating items...')
    await interaction.client.sheet.updateMembers(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
