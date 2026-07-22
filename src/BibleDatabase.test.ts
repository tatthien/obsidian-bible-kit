import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import initSqlJs from 'sql.js'
import { BibleDatabase } from './BibleDatabase'

let tempDir: string
let dbPath: string
let pluginDir: string

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bible-kit-test-'))
  dbPath = path.join(tempDir, 'scripture.db')
  pluginDir = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist')

  const wasmPath = path.join(pluginDir, 'sql-wasm.wasm')
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) })
  const db = new SQL.Database()

  db.run('CREATE TABLE books (id INTEGER PRIMARY KEY, name TEXT)')
  db.run(
    `CREATE TABLE verses (
      id INTEGER PRIMARY KEY,
      book_id INTEGER,
      chapter INTEGER,
      verse INTEGER,
      text TEXT,
      FOREIGN KEY (book_id) REFERENCES books(id)
    )`,
  )

  db.run("INSERT INTO books (id, name) VALUES (1, 'Genesis')")
  db.run(
    "INSERT INTO verses (id, book_id, chapter, verse, text) VALUES (1, 1, 1, 1, 'In the beginning God created the heavens and the earth.')",
  )
  db.run(
    "INSERT INTO verses (id, book_id, chapter, verse, text) VALUES (2, 1, 1, 2, 'The earth was formless and void.')",
  )
  db.run(
    "INSERT INTO verses (id, book_id, chapter, verse, text) VALUES (3, 1, 1, 3, 'And God said, Let there be light.')",
  )
  db.run(
    "INSERT INTO verses (id, book_id, chapter, verse, text) VALUES (4, 1, 2, 1, 'Thus the heavens and the earth were finished.')",
  )

  const buffer = Buffer.from(db.export())
  fs.writeFileSync(dbPath, buffer)
  db.close()
})

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
})

describe('BibleDatabase', () => {
  let bibleDb: BibleDatabase

  beforeAll(async () => {
    bibleDb = new BibleDatabase(dbPath, pluginDir)
    await bibleDb.initialize()
  })

  afterAll(() => {
    bibleDb.close()
  })

  describe('getVerses', () => {
    it('should look up verses by chapter', () => {
      const result = bibleDb.getVerses('sa 1')
      expect(result.reference).toBe('Sáng-thế Ký 1')
      expect(result.verses).toHaveLength(3)
      expect(result.verses[0].text).toContain('beginning')
      expect(result.verses[0].reference).toBe('Sáng-thế Ký 1:1')
    })

    it('should look up a single verse', () => {
      const result = bibleDb.getVerses('sa 1:1')
      expect(result.reference).toBe('Sáng-thế Ký 1:1')
      expect(result.verses).toHaveLength(1)
      expect(result.verses[0].verse).toBe(1)
    })

    it('should look up a verse range', () => {
      const result = bibleDb.getVerses('sa 1:1-2')
      expect(result.reference).toBe('Sáng-thế Ký 1:1-2')
      expect(result.verses).toHaveLength(2)
      expect(result.verses[0].verse).toBe(1)
      expect(result.verses[1].verse).toBe(2)
    })

    it('should handle numbered book abbreviations like 1sa', () => {
      const result = bibleDb.getVerses('1sa 2:1')
      expect(result.reference).toBe('1 Sa-mu-ên 2:1')
    })

    it('should throw for invalid address', () => {
      expect(() => bibleDb.getVerses('not a verse')).toThrow(
        'Invalid bible address',
      )
    })
  })

  describe('searchVerses', () => {
    it('should return empty array when FTS query fails (no FTS table)', () => {
      const results = bibleDb.searchVerses('God')
      expect(results).toEqual([])
    })
  })
})
