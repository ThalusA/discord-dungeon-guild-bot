import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('requestGold')
    .addIntegerOption(option => option.setName('amount').setRequired(true))
    .setDescription('Request specified amount of gold from the bank.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply(`Pong! ${Date.now() - interaction.createdTimestamp}ms`)
  }
}

export default command
