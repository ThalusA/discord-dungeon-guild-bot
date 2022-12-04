import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping... Pong... the bot.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply(`Pong! ${Date.now() - interaction.createdTimestamp}ms`)
  }
}

export default command
