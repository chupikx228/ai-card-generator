import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite'
import { buildSchema, createRepository, SCHEMA_VERSION, type SqlDatabase, type SqlValue } from '@deckly/shared/storage'

const transaction = <T>(db: SQLiteDatabase, work: () => T): T => {
  db.execSync('BEGIN')
  try {
    const result = work()
    db.execSync('COMMIT')
    return result
  } catch (error) {
    db.execSync('ROLLBACK')
    throw error
  }
}

const toSqlDatabase = (db: SQLiteDatabase): SqlDatabase => ({
  all: <T>(sql: string, params: SqlValue[] = []) => db.getAllSync<T>(sql, params),
  one: <T>(sql: string, params: SqlValue[] = []) => db.getFirstSync<T>(sql, params) ?? undefined,
  run: (sql: string, params: SqlValue[] = []) => db.runSync(sql, params).changes,
  transaction: <T>(work: () => T) => transaction(db, work),
})

const openDatabase = (): SQLiteDatabase => {
  const db = openDatabaseSync('deckly.db')
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
  const version = db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0
  if (version < SCHEMA_VERSION) {
    transaction(db, () => {
      db.execSync(buildSchema(false))
      db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION}`)
    })
  }
  return db
}

export const repository = createRepository(toSqlDatabase(openDatabase()), { fullText: false })
