export const SCHEMA_VERSION = 1

const TABLES = `
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
`

const FULL_TEXT = `
  CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(
    question, answer, content='cards', content_rowid='id', tokenize='trigram'
  );
`

const counterTriggers = (fullText: boolean) => `
  CREATE TRIGGER IF NOT EXISTS cards_after_insert AFTER INSERT ON cards BEGIN
    UPDATE decks SET total = total + 1, learned = learned + NEW.learned WHERE id = NEW.deck_id;
    ${fullText ? 'INSERT INTO cards_fts(rowid, question, answer) VALUES (NEW.id, NEW.question, NEW.answer);' : ''}
  END;

  CREATE TRIGGER IF NOT EXISTS cards_after_delete AFTER DELETE ON cards BEGIN
    UPDATE decks SET total = total - 1, learned = learned - OLD.learned WHERE id = OLD.deck_id;
    ${fullText ? "INSERT INTO cards_fts(cards_fts, rowid, question, answer) VALUES ('delete', OLD.id, OLD.question, OLD.answer);" : ''}
  END;

  CREATE TRIGGER IF NOT EXISTS cards_after_update AFTER UPDATE ON cards BEGIN
    UPDATE decks SET total = total - 1, learned = learned - OLD.learned WHERE id = OLD.deck_id;
    UPDATE decks SET total = total + 1, learned = learned + NEW.learned WHERE id = NEW.deck_id;
    ${fullText ? "INSERT INTO cards_fts(cards_fts, rowid, question, answer) VALUES ('delete', OLD.id, OLD.question, OLD.answer);" : ''}
    ${fullText ? 'INSERT INTO cards_fts(rowid, question, answer) VALUES (NEW.id, NEW.question, NEW.answer);' : ''}
  END;
`

export const buildSchema = (fullText: boolean): string => `${TABLES}${fullText ? FULL_TEXT : ''}${counterTriggers(fullText)}`
