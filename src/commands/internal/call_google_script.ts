import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('callgooglescript')
    .setDescription('Forces the Google Script to start.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Calling Google Script...')
    await interaction.client.sheet.callAppsScript(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
