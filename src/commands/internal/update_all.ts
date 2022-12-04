import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types.js'
import { updateAll } from '../../utils.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updateall')
    .setDescription('Does every update function at once.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Updating all...')
    await updateAll(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
