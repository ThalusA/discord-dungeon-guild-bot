import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, Client } from 'discord.js'
import type { InternalCommand } from '../../types'

export async function updateAll (client: Client): Promise<void> {
  await client.sheet.updateGuildInfo(client)
  await client.cache.updateGuild(client)
  await client.sheet.updateInventory(client)
  await client.cache.updateGuildMembers(client)
  await client.cache.updateDiscordMembers(client)
  await client.sheet.updateMembers(client)
}

const command: InternalCommand = {
  data: new SlashCommandBuilder()
    .setName('updateAll')
    .setDescription('Does every update function at once.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Updating all...')
    await updateAll(interaction.client)
    await interaction.reply('Done!')
  }
}

export default command
