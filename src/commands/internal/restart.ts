import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Restarting bot...')
    await interaction.client.destroy()
    await interaction.client.login(process.env.DISCORD_TOKEN)
  }
}

export default command
