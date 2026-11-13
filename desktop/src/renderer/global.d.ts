import type { CardsAPI } from '../ipc/contract'

declare global {
  interface Window {
    cardsAPI: CardsAPI
  }
}
