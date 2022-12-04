import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('requestgold')
    .addIntegerOption(option => option.setName('amount').setRequired(true))
    .setDescription('Request specified amount of gold from the bank.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const amount = interaction.options.getInteger('amount')
    if (amount === null) return
    await interaction.client.sheet.addRequest(interaction.client, interaction.createdAt, interaction.user.username, 'gold', amount)
    await interaction.reply(`You just requested : ${amount.toLocaleString()} gold`)
  }
}

export default command
