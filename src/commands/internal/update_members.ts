import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updatemembers')
    .setDescription('Updates the list of members in the guild.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Updating items...')
    await interaction.client.sheet.updateMembers(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
