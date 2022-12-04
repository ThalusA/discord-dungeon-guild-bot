import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updateitems')
    .setDescription('Updates the list of all DRPG items.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Updating items...')
    await interaction.client.cache.updateItems(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
