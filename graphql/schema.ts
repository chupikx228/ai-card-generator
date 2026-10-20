export const typeDefs = `#graphql
  enum DeckMode {
    flip
    qa
    truefalse
  }

  enum DeckLanguage {
    uk
    en
  }

  type User {
    id: ID!
    name: String!
    email: String!
    decks: [Deck!]!
  }

  type Card {
    id: ID!
    front: String
    back: String
    statement: String
    isTrue: Boolean
  }

  type Deck {
    id: ID!
    title: String!
    topic: String
    mode: DeckMode!
    language: DeckLanguage!
    cards: [Card!]!
    cardCount: Int!
    owner: User!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CardInput {
    front: String
    back: String
    statement: String
    isTrue: Boolean
  }

  type Query {
    users: [User!]!
    me: User
    decks: [Deck!]!
    deck(id: ID!): Deck
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createDeck(title: String!, mode: DeckMode!, language: DeckLanguage!, topic: String, cards: [CardInput!]!): Deck!
    deleteDeck(id: ID!): Boolean!
  }
`;
