import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Stopping bot...')
    process.exit(0)
  }
}

export default command
