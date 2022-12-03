import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('callGoogleScript')
    .setDescription('Forces the Google Script to start.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Calling Google Script...')
    await interaction.client.sheet.callAppsScript(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
