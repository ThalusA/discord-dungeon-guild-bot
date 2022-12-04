import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('requestlist')
    .setDescription('List all pending requests from the bank for your account.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (interaction.user.id in interaction.client.requests) {
      let reply = 'Here are your pending requests:'
      const items = interaction.client.requests.get(interaction.user.id)
      if (items !== undefined) {
        for (const [name, amount] of Object.entries(items)) {
          reply += `\n${name === 'gold' ? (-amount).toLocaleString() : -amount} ${name}`
        }
        await interaction.reply(reply)
      }
    } else {
      await interaction.reply('You have no pending requests.')
    }
  }
}

export default command
