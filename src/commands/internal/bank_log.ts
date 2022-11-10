import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('bankLog')
    .setDescription('Show the bank spreadsheet link.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder().setColor(0x7F23FF).setTitle('Bank Log Links').setFields([{
      name: 'Website',
      value: `[Click here](${process.env.WEBSITE_URL as string})`
    }, {
      name: 'Spreadsheet',
      value: `[Click here](${process.env.SPREADSHEET_URL as string})`
    }])
    if (interaction.channel === null) {
      throw new Error('You are not inside a channel')
    } else {
      await interaction.channel.send({ embeds: [embed] })
    }
  }
}

export default command
