import DiscordDungeonCache from './cache'
import Sheet from './sheets'
import { Collection } from 'discord.js'
import { Environment } from './types'

declare module 'discord.js' {
  export interface Client {
    cache: DiscordDungeonCache
    sheet: Sheet
    requests: Collection<string, Collection<string, number>>
    clocks: Collection<string, NodeJS.Timeout>
    env: Environment
  }
}
