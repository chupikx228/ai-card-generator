export const ROUTES = {
  home: '#/',
  login: '#/login',
  cards: '#/cards',
} as const

export type Route = keyof typeof ROUTES

const NESTED_ROUTES: Route[] = ['login', 'cards']

export const matchRoute = (hash: string): Route => NESTED_ROUTES.find((route) => hash.startsWith(ROUTES[route])) ?? 'home'
