import {
  Collection,
  Client,
  REST,
  Routes,
  GatewayIntentBits,
  Events
} from 'discord.js'
import type { InternalCommand, ExternalCommand, Environment } from './types.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import DiscordDungeonCache from './cache.js'
import Sheet from './sheets.js'
import { fileURLToPath } from 'url'
import { updateAll } from './utils.js'
import { constants } from 'fs'

const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const WEBSITE_URL = process.env.WEBSITE_URL
const GOOGLE_SPREADSHEET_URL = process.env.GOOGLE_SPREADSHEET_URL
const GOOGLE_SCRIPT_ID = process.env.GOOGLE_SCRIPT_ID
const GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID
const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID
const DISCORD_MISSING_MEMBERS_CHANNEL_ID = process.env.DISCORD_MISSING_MEMBERS_CHANNEL_ID
const DISCORD_REQUEST_CHANNEL_ID = process.env.DISCORD_REQUEST_CHANNEL_ID
const DISCORD_DUNGEONS_BOT_ID = process.env.DISCORD_DUNGEONS_BOT_ID
const DISCORD_DUNGEONS_GUILD_ID = process.env.DISCORD_DUNGEONS_GUILD_ID
const DISCORD_DUNGEONS_API_KEY = process.env.DISCORD_DUNGEONS_API_KEY
const DISCORD_MEMBER_ROLE_ID = process.env.DISCORD_MEMBER_ROLE_ID
const DISCORD_ELDER_ROLE_ID = process.env.DISCORD_ELDER_ROLE_ID
const DISCORD_NO_GUILD_ROLE_ID = process.env.DISCORD_NO_GUILD_ROLE_ID
const DISCORD_ALLIED_GUILD_ROLE_ID = process.env.DISCORD_ALLIED_GUILD_ROLE_ID
const DISCORD_OTHER_GUILD_ROLE_ID = process.env.DISCORD_OTHER_GUILD_ROLE_ID
const DISCORD_IRON_ROLE_ID = process.env.DISCORD_IRON_ROLE_ID

const env = {
  DISCORD_TOKEN,
  WEBSITE_URL,
  GOOGLE_SPREADSHEET_URL,
  GOOGLE_SCRIPT_ID,
  GOOGLE_SPREADSHEET_ID,
  GOOGLE_CREDENTIALS,
  DISCORD_GUILD_ID,
  DISCORD_MISSING_MEMBERS_CHANNEL_ID,
  DISCORD_REQUEST_CHANNEL_ID,
  DISCORD_DUNGEONS_BOT_ID,
  DISCORD_DUNGEONS_GUILD_ID,
  DISCORD_DUNGEONS_API_KEY,
  DISCORD_MEMBER_ROLE_ID,
  DISCORD_ELDER_ROLE_ID,
  DISCORD_NO_GUILD_ROLE_ID,
  DISCORD_ALLIED_GUILD_ROLE_ID,
  DISCORD_OTHER_GUILD_ROLE_ID,
  DISCORD_IRON_ROLE_ID
}

for (const [name, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Missing environment variable ${name}`)
  }
}

const environment = env as Environment
const DEPLOYED = await fs.access('/credentials', constants.F_OK).then(() => true).catch(() => false)
const CREDENTIALS_PATH = path.join(DEPLOYED ? '/credentials' : process.cwd(), 'credentials.json')
await fs.writeFile(CREDENTIALS_PATH, environment.GOOGLE_CREDENTIALS)

const internalCommands: Collection<string, InternalCommand> = new Collection()
const externalCommands: Collection<string, ExternalCommand> = new Collection()

const dirname = path.dirname(fileURLToPath(import.meta.url))
const commandsPath = path.join(dirname, 'commands')

const internalCommandsPath = path.join(commandsPath, 'internal')
const externalCommandsPath = path.join(commandsPath, 'external')

const internalCommandFiles = (await fs.readdir(internalCommandsPath)).filter(file => file.endsWith('.js'))
const externalCommandFiles = (await fs.readdir(externalCommandsPath)).filter(file => file.endsWith('.js'))

for (const file of internalCommandFiles) {
  const command: InternalCommand = (await import(path.join(internalCommandsPath, file))).default
  internalCommands.set(command.data.name, command)
}
for (const file of externalCommandFiles) {
  const command: ExternalCommand = (await import(path.join(externalCommandsPath, file))).default
  externalCommands.set(command.keyword, command)
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN as string)
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
client.cache = new DiscordDungeonCache()
client.sheet = new Sheet()
client.requests = new Collection()
client.clocks = new Collection()
client.env = environment

client.once(Events.ClientReady, async () => {
  try {
    console.log(`Started refreshing ${internalCommands.size} application (/) commands.`)

    if (client.user === null) {
      console.error('Client user is null')
      return
    }

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: internalCommands.map(command => command.data.toJSON()) }
    )

    console.log(`Successfully reloaded ${internalCommands.size} application (/) commands.`)

    updateAll(client).finally(() => {
      setInterval(() => { void updateAll(client) }, 900000)
      setInterval(() => { void client.cache.updateItems(client) }, 86400000)
    })
  } catch (error) {
    console.error(error)
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  const command = internalCommands.get(interaction.commandName)

  if (command == null) {
    console.error(`Command ${interaction.commandName} was not found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

client.on(Events.MessageCreate, async message => {
  if (!message.author.bot || message.author.id !== DISCORD_DUNGEONS_BOT_ID) return
  const command = externalCommands.find((_, keyword) => message.content.includes(keyword))
  if (command == null) return

  try {
    await command.execute({ client, message })
    await message.react('✅')
  } catch (error) {
    console.error(error)
    await message.react('❌')
  }
})

await client.login(DISCORD_TOKEN)
