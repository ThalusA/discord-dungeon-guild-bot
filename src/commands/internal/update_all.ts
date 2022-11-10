import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updateAll')
    .setDescription('Does every update function at once.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {

  }
}

export default command
