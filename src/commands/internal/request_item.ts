import {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('requestItem')
    .addStringOption(option => option.setName('name').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setRequired(true))
    .setDescription('Request a specific amount of a specific item from the bank.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    // const name = interaction.options.get('name')?.value as string
    // const amount = interaction.options.get('amount')?.value as number
  }
}

export default command
