import { contextBridge, ipcRenderer } from 'electron'
import { type CardsAPI, CHANNELS } from '../ipc/contract'

const cardsAPI: CardsAPI = {
  listDecks: () => ipcRenderer.invoke(CHANNELS.listDecks),
  createDeck: (title) => ipcRenderer.invoke(CHANNELS.createDeck, title),
  renameDeck: (id, title) => ipcRenderer.invoke(CHANNELS.renameDeck, id, title),
  removeDeck: (id) => ipcRenderer.invoke(CHANNELS.removeDeck, id),
  stats: (scope) => ipcRenderer.invoke(CHANNELS.stats, scope),
  queryCards: (query) => ipcRenderer.invoke(CHANNELS.queryCards, query),
  studyCards: (scope, limit) => ipcRenderer.invoke(CHANNELS.studyCards, scope, limit),
  addCards: (deckId, title, drafts) => ipcRenderer.invoke(CHANNELS.addCards, deckId, title, drafts),
  updateCard: (id, draft, deckId) => ipcRenderer.invoke(CHANNELS.updateCard, id, draft, deckId),
  setLearned: (id, learned) => ipcRenderer.invoke(CHANNELS.setLearned, id, learned),
  removeCard: (id) => ipcRenderer.invoke(CHANNELS.removeCard, id),
  generateDeck: (params, requestId) => ipcRenderer.invoke(CHANNELS.generate, params, requestId),
  cancelGenerate: (requestId) => ipcRenderer.invoke(CHANNELS.cancelGenerate, requestId),
}

contextBridge.exposeInMainWorld('cardsAPI', cardsAPI)
