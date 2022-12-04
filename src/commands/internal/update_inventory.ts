import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updateInventory')
    .setDescription("Updates the guild's inventory.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Updating inventory...')
    await interaction.client.sheet.updateInventory(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
