import DiscordDungeonCache from './cache.js'
import Sheet from './sheets.js'
import { Collection } from 'discord.js'
import { Environment } from './types.js'

declare module 'discord.js' {
  export interface Client {
    cache: DiscordDungeonCache
    sheet: Sheet
    requests: Collection<string, Collection<string, number>>
    clocks: Collection<string, NodeJS.Timeout>
    env: Environment
  }
}
