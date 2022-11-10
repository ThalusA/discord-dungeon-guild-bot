import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('callGoogleScript')
    .setDescription('Forces the Google Script to start.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {

  }
}

export default command
