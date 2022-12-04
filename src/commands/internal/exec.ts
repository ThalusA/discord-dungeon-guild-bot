import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import type { InternalCommand } from '../../types.js'

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('exec')
    .setDescription('Execute the provided command.')
    .addStringOption(option => option
      .setName('command')
      .setDescription('What command to execute.')
      .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      // eslint-disable-next-line no-eval
      eval(interaction.options.get('command')?.value as string)
    } catch (error) {
      const thrownError = error as Error
      await interaction.reply({ content: `Error executing this function :: \`\`\`${thrownError.message}\`\`\``, ephemeral: true })
    }
  }
}

export default command
