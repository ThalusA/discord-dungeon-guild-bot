import DiscordDungeonCache from './cache'
import Sheet from './sheets'

declare module 'discord.js' {
  export interface Client {
    cache: DiscordDungeonCache
    sheet: Sheet
  }
}
