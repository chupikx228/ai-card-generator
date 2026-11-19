import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { buildSchema, SCHEMA_VERSION, type SqlDatabase, type SqlValue } from '@deckly/shared/storage'
import { parseLibrary } from '@deckly/shared/study-cards/schema'

export const transaction = <T>(db: DatabaseSync, work: () => T): T => {
  db.exec('BEGIN')
  try {
    const result = work()
    db.exec('COMMIT')
    return result
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export const toSqlDatabase = (db: DatabaseSync): SqlDatabase => ({
  all: <T>(sql: string, params: SqlValue[] = []) => db.prepare(sql).all(...params) as T[],
  one: <T>(sql: string, params: SqlValue[] = []) => db.prepare(sql).get(...params) as T | undefined,
  run: (sql: string, params: SqlValue[] = []) => Number(db.prepare(sql).run(...params).changes),
  transaction: <T>(work: () => T) => transaction(db, work),
})

const importLegacyJson = (db: DatabaseSync, jsonPath: string): void => {
  if (!fs.existsSync(jsonPath)) {
    return
  }
  const { count } = db.prepare('SELECT count(*) AS count FROM decks').get() as { count: number }
  if (count > 0) {
    return
  }
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  } catch {
    return
  }
  const library = parseLibrary(raw)
  const insertDeck = db.prepare('INSERT INTO decks (id, title, created_at) VALUES (?, ?, ?)')
  const insertCard = db.prepare(
    'INSERT INTO cards (id, deck_id, question, answer, topic, due_date, learned) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
  transaction(db, () => {
    for (const deck of library.decks) {
      insertDeck.run(deck.id, deck.title, deck.createdAt)
    }
    for (const card of library.cards) {
      insertCard.run(card.id, card.deckId ?? '', card.question, card.answer, card.topic, card.dueDate, card.learned ? 1 : 0)
    }
  })
  fs.renameSync(jsonPath, `${jsonPath}.imported`)
}

export const openDatabase = (dataDir: string): DatabaseSync => {
  const db = new DatabaseSync(process.env.DECKLY_DB_FILE ?? path.join(dataDir, 'deckly.db'))
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA synchronous = NORMAL')
  const { user_version: version } = db.prepare('PRAGMA user_version').get() as { user_version: number }
  if (version < SCHEMA_VERSION) {
    transaction(db, () => {
      db.exec(buildSchema(true))
      db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`)
    })
  }
  importLegacyJson(db, path.join(dataDir, 'cards.json'))
  return db
}
