import { Client, Collection, Message } from 'discord.js'
import { Member, InfoType } from './types.js'

type MapLF<T extends InfoType> =
  T extends InfoType.User ? Member :
    T extends InfoType.Amount ? number :
      string

type MapLFs<T extends readonly InfoType[], R extends unknown[] = []> =
  T extends [] ? R :
    T extends readonly [
      infer Head extends InfoType,
      ...infer Tail extends InfoType[]
    ] ? MapLFs<Tail, [...R, MapLF<Head>]> :
      T

export function parseDiscordDungeonMessage<T extends readonly InfoType[]> (client: Client, message: Message, regexp: RegExp, types: T): MapLFs<T> | null {
  const result = regexp.exec(message.content)
  if (result === null) {
    return null
  }
  if (result.groups === undefined) {
    return null
  }
  const parsedInfos = types.map((type, index) => {
    const group = result.groups?.[index + 1]
    if (group === undefined) {
      return undefined
    } else if (type === InfoType.Amount) {
      return parseInt((['a', 'the'].includes(group.toLowerCase()) ? '1' : group).replace(/,/g, ''))
    } else if (type === InfoType.Item) {
      return client.cache.items.find(i => i.name === group || i.plural === group)?.name
    } else if (type === InfoType.User) {
      return client.cache.guildMembers.get(group)
    } else throw new TypeError()
  })
  if (parsedInfos.some(value => value === undefined)) {
    return null
  } else {
    return parsedInfos as MapLFs<T>
  }
}

export async function finishRequest (client: Client, message: Message, user: Member): Promise<void> {
  clearTimeout(client.clocks.get(user.id))
  if (client.requests.get(user.id)?.size !== 0) {
    client.clocks.set(user.id, setTimeout((user) => {
      void (async () => {
        if (user.id in client.requests) {
          const requests = client.requests.get(user.id) as Collection<string, number>
          for (const [item, amount] of requests.entries()) {
            await client.sheet.reportRequest(client, user.name, user.id, item, amount)
          }
        }
      })()
    }, 60000, user))
  }
  await message.react('✅')
}
