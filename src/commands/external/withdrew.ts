import type { ExternalCommand } from '../../types'
import { Collection } from 'discord.js'
import { finishRequest, parseDiscordDungeonMessage } from '../../utils'
import { InfoType } from '../../types'

const command: ExternalCommand = {
  keyword: 'withdrew',
  execute: async ({ client, message }) => {
    const regexp = /(.+) withdrew ([^ ]+) (.+) from their guild/
    const parsedInfos = await parseDiscordDungeonMessage(client, message, regexp, [InfoType.User, InfoType.Amount, InfoType.Item] as const)
    if (parsedInfos === null) {
      await message.react('❌')
      return
    }
    const [user, calculatedAmount, foundItem] = parsedInfos
    const requests = client.requests.get(user.id) ?? new Collection()
    if (requests.size === 0) client.requests.set(user.id, requests)
    const request = requests.get(foundItem)
    const newRequest = request !== undefined ? request - calculatedAmount : -calculatedAmount
    requests.set(foundItem, newRequest)
    if (newRequest === 0) {
      requests.delete(foundItem)
    }
    await finishRequest(client, message, user)
  }
}

export default command
