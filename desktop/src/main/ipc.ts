import { ipcMain } from 'electron'
import type { Repository } from '@deckly/shared/storage'
import { CHANNELS } from '../ipc/contract'
import { cancelGenerate, generateDeck } from './generate-deck'
import { createHandlers } from './handlers'

export const registerIpc = (repository: Repository): void => {
  for (const [channel, handler] of Object.entries(createHandlers(repository))) {
    ipcMain.handle(channel, (_event, ...args: unknown[]) => handler(...args))
  }
  ipcMain.handle(CHANNELS.generate, (_event, params: unknown, requestId: unknown) => generateDeck(params, requestId))
  ipcMain.handle(CHANNELS.cancelGenerate, (_event, requestId: unknown) => cancelGenerate(requestId))
}
