import type { ExternalCommand } from '../../types.js'
import { InfoType } from '../../types.js'
import { finishRequest, parseDiscordDungeonMessage } from '../../utils.js'

const command: ExternalCommand = {
  keyword: 'donated',
  execute: async ({ client, message }) => {
    const regexp = /(.+) donated ([^ ]+) (.+) to (.+)/
    const parsedInfos = await parseDiscordDungeonMessage(client, message, regexp, [InfoType.User, InfoType.Amount, InfoType.Item, InfoType.User] as const)
    if (parsedInfos === null) {
      await message.react('❌')
      return
    }
    const [donor, calculatedAmount, foundItem, recipient] = parsedInfos
    const requests = client.requests.get(donor.id)
    if (requests !== undefined && requests.size !== 0) {
      const requestAmount = requests.get(foundItem)
      if (requestAmount !== undefined) {
        const newRequestAmount = Math.min(requestAmount + calculatedAmount, 0)
        requests.set(foundItem, newRequestAmount)
        if (newRequestAmount === 0) {
          await client.sheet.reportRequest(client, recipient.name, recipient.id, foundItem, requestAmount)
          requests.delete(foundItem)
        } else if (newRequestAmount < 0) {
          await client.sheet.reportRequest(client, recipient.name, recipient.id, foundItem, requestAmount - newRequestAmount)
        }
        await finishRequest(client, message, donor)
      }
    }
  }
}

export default command
