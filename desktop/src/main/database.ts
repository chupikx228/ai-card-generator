import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { parseLibrary } from '@shared/study-cards/schema'

const SCHEMA_VERSION = 1

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    learned INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY,
    deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    topic TEXT NOT NULL,
    due_date TEXT NOT NULL DEFAULT '',
    learned INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS cards_by_deck ON cards(deck_id, id);

  CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(
    question, answer, content='cards', content_rowid='id', tokenize='trigram'
  );

  CREATE TRIGGER IF NOT EXISTS cards_after_insert AFTER INSERT ON cards BEGIN
    UPDATE decks SET total = total + 1, learned = learned + NEW.learned WHERE id = NEW.deck_id;
    INSERT INTO cards_fts(rowid, question, answer) VALUES (NEW.id, NEW.question, NEW.answer);
  END;

  CREATE TRIGGER IF NOT EXISTS cards_after_delete AFTER DELETE ON cards BEGIN
    UPDATE decks SET total = total - 1, learned = learned - OLD.learned WHERE id = OLD.deck_id;
    INSERT INTO cards_fts(cards_fts, rowid, question, answer) VALUES ('delete', OLD.id, OLD.question, OLD.answer);
  END;

  CREATE TRIGGER IF NOT EXISTS cards_after_update AFTER UPDATE ON cards BEGIN
    UPDATE decks SET total = total - 1, learned = learned - OLD.learned WHERE id = OLD.deck_id;
    UPDATE decks SET total = total + 1, learned = learned + NEW.learned WHERE id = NEW.deck_id;
    INSERT INTO cards_fts(cards_fts, rowid, question, answer) VALUES ('delete', OLD.id, OLD.question, OLD.answer);
    INSERT INTO cards_fts(rowid, question, answer) VALUES (NEW.id, NEW.question, NEW.answer);
  END;
`

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
      db.exec(SCHEMA)
      db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`)
    })
  }
  importLegacyJson(db, path.join(dataDir, 'cards.json'))
  return db
}
