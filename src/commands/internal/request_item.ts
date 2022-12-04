import {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('requestItem')
    .addStringOption(option => option.setName('name').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setRequired(true))
    .setDescription('Request a specific amount of a specific item from the bank.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const name = interaction.options.getString('name')
    const amount = interaction.options.getInteger('amount')
    if (amount === null || name == null) return
    const foundItem = interaction.client.cache.items.find(item => item.name === name.toLowerCase())
    if (foundItem != null) {
      if (foundItem.tradable) {
        await interaction.client.sheet.addRequest(interaction.client, interaction.createdAt, interaction.user.username, foundItem.name, amount)
        await interaction.reply(`You just requested : ${amount.toLocaleString()} ${foundItem.name}`)
      } else {
        await interaction.reply(`You can't request ${foundItem.name} from the bank.`)
      }
    } else {
      await interaction.reply(`Item ${name} not found.`)
    }
  }
}

export default command
