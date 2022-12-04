import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('bankLog')
    .setDescription('Show the bank spreadsheet link.'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder().setColor('#7F23FF').setTitle('Bank Log Links').setFields([{
      name: 'Website',
      value: `[Click here](${interaction.client.env.WEBSITE_URL})`
    }, {
      name: 'Spreadsheet',
      value: `[Click here](${interaction.client.env.GOOGLE_SPREADSHEET_URL})`
    }])
    if (interaction.channel === null) {
      throw new Error('You are not inside a channel')
    } else {
      await interaction.channel.send({ embeds: [embed] })
    }
  }
}

export default command
