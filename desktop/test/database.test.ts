import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, test } from 'node:test'
import { createRepository } from '@deckly/shared/storage'
import { openDatabase, toSqlDatabase } from '../src/main/database.ts'

let dataDir = ''

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deckly-desktop-'))
})

afterEach(() => {
  fs.rmSync(dataDir, { recursive: true, force: true })
})

test('openDatabase створює файл бази з порожньою бібліотекою', () => {
  const db = openDatabase(dataDir)
  const repository = createRepository(toSqlDatabase(db), { fullText: true })
  assert.deepEqual(repository.listDecks(), [])
  db.close()
  assert.ok(fs.existsSync(path.join(dataDir, 'deckly.db')))
})

test('дані зберігаються у файлі між запусками', () => {
  const first = openDatabase(dataDir)
  createRepository(toSqlDatabase(first), { fullText: true }).addCards(null, 'Колода', [{ question: 'Q', answer: 'A' }])
  first.close()

  const second = openDatabase(dataDir)
  const repository = createRepository(toSqlDatabase(second), { fullText: true })
  assert.equal(repository.listDecks()[0]?.title, 'Колода')
  assert.deepEqual({ ...repository.stats({ kind: 'all' }) }, { total: 1, learned: 0 })
  second.close()
})

test('transaction відкочує зміни при помилці', () => {
  const db = openDatabase(dataDir)
  const sql = toSqlDatabase(db)
  assert.throws(() =>
    sql.transaction(() => {
      sql.run('INSERT INTO decks (id, title, created_at) VALUES (?, ?, ?)', ['d1', 'Тимчасова', 1])
      throw new Error('fail')
    }),
  )
  assert.equal(sql.all('SELECT id FROM decks').length, 0)
  db.close()
})

test('старий cards.json імпортується, а пошкоджений файл ігнорується', () => {
  const card = { id: 1, question: 'Q', answer: 'A', topic: 'Інше', dueDate: '', learned: true }
  fs.writeFileSync(path.join(dataDir, 'cards.json'), JSON.stringify([card]))
  const db = openDatabase(dataDir)
  assert.deepEqual({ ...createRepository(toSqlDatabase(db), { fullText: true }).stats({ kind: 'all' }) }, { total: 1, learned: 1 })
  db.close()
  assert.ok(fs.existsSync(path.join(dataDir, 'cards.json.imported')))

  const brokenDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deckly-broken-'))
  fs.writeFileSync(path.join(brokenDir, 'cards.json'), '{broken')
  const broken = openDatabase(brokenDir)
  assert.deepEqual(createRepository(toSqlDatabase(broken), { fullText: true }).listDecks(), [])
  broken.close()
  fs.rmSync(brokenDir, { recursive: true, force: true })
})
