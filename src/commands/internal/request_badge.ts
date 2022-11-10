import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('requestBadge')
    .setDescription('Request the Nova badge'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply(`Pong! ${Date.now() - interaction.createdTimestamp}ms`)
  }
}

export default command
