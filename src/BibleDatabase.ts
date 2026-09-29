import * as fs from 'fs'
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'
import wasmBinary from 'sql.js/dist/sql-wasm.wasm'
import type { Book, Verse } from './types'

type BookInfo = {
  bookId: number
  bookName: {
    vi: string
    en: string
  }
}

const bibleBookMap: Record<string, BookInfo> = {
  sa: { bookId: 1, bookName: { vi: 'Sáng-thế Ký', en: 'Genesis' } },
  xu: { bookId: 2, bookName: { vi: 'Xuất Ê-díp-tô Ký', en: 'Exodus' } },
  le: { bookId: 3, bookName: { vi: 'Lê-vi Ký', en: 'Leviticus' } },
  dan: { bookId: 4, bookName: { vi: 'Dân-số Ký', en: 'Numbers' } },
  phu: {
    bookId: 5,
    bookName: { vi: 'Phục-truyền Luật-lệ Ký', en: 'Deuteronomy' },
  },
  gios: { bookId: 6, bookName: { vi: 'Giô-suê', en: 'Joshua' } },
  cac: { bookId: 7, bookName: { vi: 'Các Quan Xét', en: 'Judges' } },
  ru: { bookId: 8, bookName: { vi: 'Ru-tơ', en: 'Ruth' } },
  '1sa': { bookId: 9, bookName: { vi: '1 Sa-mu-ên', en: '1 Samuel' } },
  '2sa': { bookId: 10, bookName: { vi: '2 Sa-mu-ên', en: '2 Samuel' } },
  '1vua': { bookId: 11, bookName: { vi: '1 Các Vua', en: '1 Kings' } },
  '2vua': { bookId: 12, bookName: { vi: '2 Các Vua', en: '2 Kings' } },
  '1su': { bookId: 13, bookName: { vi: '1 Sử-ký', en: '1 Chronicles' } },
  '2su': { bookId: 14, bookName: { vi: '2 Sử-ký', en: '2 Chronicles' } },
  exo: { bookId: 15, bookName: { vi: 'E-xơ-ra', en: 'Ezra' } },
  ne: { bookId: 16, bookName: { vi: 'Nê-hê-mi', en: 'Nehemiah' } },
  et: { bookId: 17, bookName: { vi: 'Ê-xơ-tê', en: 'Esther' } },
  giop: { bookId: 18, bookName: { vi: 'Gióp', en: 'Job' } },
  thi: { bookId: 19, bookName: { vi: 'Thi-thiên', en: 'Psalms' } },
  ch: { bookId: 20, bookName: { vi: 'Châm-ngôn', en: 'Proverbs' } },
  tr: { bookId: 21, bookName: { vi: 'Truyền-đạo', en: 'Ecclesiastes' } },
  nha: { bookId: 22, bookName: { vi: 'Nhã-ca', en: 'Song of Solomon' } },
  es: { bookId: 23, bookName: { vi: 'Ê-sai', en: 'Isaiah' } },
  gie: { bookId: 24, bookName: { vi: 'Giê-rê-mi', en: 'Jeremiah' } },
  ca: { bookId: 25, bookName: { vi: 'Ca-thương', en: 'Lamentations' } },
  exe: { bookId: 26, bookName: { vi: 'Ê-xê-chi-ên', en: 'Ezekiel' } },
  da: { bookId: 27, bookName: { vi: 'Đa-ni-ên', en: 'Daniel' } },
  os: { bookId: 28, bookName: { vi: 'Ô-sê', en: 'Hosea' } },
  gio: { bookId: 29, bookName: { vi: 'Giô-ên', en: 'Joel' } },
  am: { bookId: 30, bookName: { vi: 'A-mốt', en: 'Amos' } },
  ap: { bookId: 31, bookName: { vi: 'Áp-đia', en: 'Obadiah' } },
  gion: { bookId: 32, bookName: { vi: 'Giô-na', en: 'Jonah' } },
  mi: { bookId: 33, bookName: { vi: 'Mi-chê', en: 'Micah' } },
  na: { bookId: 34, bookName: { vi: 'Na-hum', en: 'Nahum' } },
  ha: { bookId: 35, bookName: { vi: 'Ha-ba-cúc', en: 'Habakkuk' } },
  so: { bookId: 36, bookName: { vi: 'Sô-phô-ni', en: 'Zephaniah' } },
  ag: { bookId: 37, bookName: { vi: 'A-ghê', en: 'Haggai' } },
  xa: { bookId: 38, bookName: { vi: 'Xa-cha-ri', en: 'Zechariah' } },
  ma: { bookId: 39, bookName: { vi: 'Ma-la-chi', en: 'Malachi' } },
  mat: { bookId: 40, bookName: { vi: 'Ma-thi-ơ', en: 'Matthew' } },
  mac: { bookId: 41, bookName: { vi: 'Mác', en: 'Mark' } },
  lu: { bookId: 42, bookName: { vi: 'Lu-ca', en: 'Luke' } },
  gi: { bookId: 43, bookName: { vi: 'Giăng', en: 'John' } },
  cong: { bookId: 44, bookName: { vi: 'Công-vụ các Sứ-đồ', en: 'Acts' } },
  ro: { bookId: 45, bookName: { vi: 'Rô-ma', en: 'Romans' } },
  '1co': { bookId: 46, bookName: { vi: '1 Cô-rinh-tô', en: '1 Corinthians' } },
  '2co': { bookId: 47, bookName: { vi: '2 Cô-rinh-tô', en: '2 Corinthians' } },
  ga: { bookId: 48, bookName: { vi: 'Ga-la-ti', en: 'Galatians' } },
  eph: { bookId: 49, bookName: { vi: 'Ê-phê-sô', en: 'Ephesians' } },
  phi: { bookId: 50, bookName: { vi: 'Phi-líp', en: 'Philippians' } },
  co: { bookId: 51, bookName: { vi: 'Cô-lô-se', en: 'Colossians' } },
  '1te': {
    bookId: 52,
    bookName: { vi: '1 Tê-sa-lô-ni-ca', en: '1 Thessalonians' },
  },
  '2te': {
    bookId: 53,
    bookName: { vi: '2 Tê-sa-lô-ni-ca', en: '2 Thessalonians' },
  },
  '1ti': { bookId: 54, bookName: { vi: '1 Ti-mô-thê', en: '1 Timothy' } },
  '2ti': { bookId: 55, bookName: { vi: '2 Ti-mô-thê', en: '2 Timothy' } },
  tit: { bookId: 56, bookName: { vi: 'Tít', en: 'Titus' } },
  phil: { bookId: 57, bookName: { vi: 'Phi-lê-môn', en: 'Philemon' } },
  he: { bookId: 58, bookName: { vi: 'Hê-bơ-rơ', en: 'Hebrews' } },
  gia: { bookId: 59, bookName: { vi: 'Gia-cơ', en: 'James' } },
  '1phi': { bookId: 60, bookName: { vi: '1 Phi-e-rơ', en: '1 Peter' } },
  '2phi': { bookId: 61, bookName: { vi: '2 Phi-e-rơ', en: '2 Peter' } },
  '1gi': { bookId: 62, bookName: { vi: '1 Giăng', en: '1 John' } },
  '2gi': { bookId: 63, bookName: { vi: '2 Giăng', en: '2 John' } },
  '3gi': { bookId: 64, bookName: { vi: '3 Giăng', en: '3 John' } },
  giu: { bookId: 65, bookName: { vi: 'Giu-đe', en: 'Jude' } },
  kh: { bookId: 66, bookName: { vi: 'Khải-huyền', en: 'Revelation' } },
}

const englishBookAliases: Record<string, number> = {
  genesis: 1,
  gen: 1,
  exodus: 2,
  exod: 2,
  ex: 2,
  leviticus: 3,
  lev: 3,
  numbers: 4,
  num: 4,
  deuteronomy: 5,
  deut: 5,
  de: 5,
  joshua: 6,
  josh: 6,
  judges: 7,
  judg: 7,
  jdg: 7,
  ruth: 8,
  '1sam': 9,
  '2sam': 10,
  '1kings': 11,
  '1kgs': 11,
  '1ki': 11,
  '2kings': 12,
  '2kgs': 12,
  '2ki': 12,
  '1chr': 13,
  '1ch': 13,
  '2chr': 14,
  '2ch': 14,
  ezra: 15,
  nehemiah: 16,
  neh: 16,
  esther: 17,
  esth: 17,
  est: 17,
  job: 18,
  psalms: 19,
  psalm: 19,
  ps: 19,
  psa: 19,
  proverbs: 20,
  prov: 20,
  pro: 20,
  ecclesiastes: 21,
  eccl: 21,
  ecc: 21,
  song: 22,
  sos: 22,
  isaiah: 23,
  isa: 23,
  jeremiah: 24,
  jer: 24,
  lamentations: 25,
  lam: 25,
  ezekiel: 26,
  ezek: 26,
  eze: 26,
  daniel: 27,
  dn: 27,
  hosea: 28,
  hos: 28,
  joel: 29,
  amos: 30,
  obadiah: 31,
  obad: 31,
  oba: 31,
  jonah: 32,
  micah: 33,
  mic: 33,
  nahum: 34,
  nah: 34,
  habakkuk: 35,
  hab: 35,
  zephaniah: 36,
  zeph: 36,
  haggai: 37,
  hag: 37,
  zechariah: 38,
  zech: 38,
  malachi: 39,
  mal: 39,
  matthew: 40,
  matt: 40,
  mt: 40,
  mark: 41,
  mk: 41,
  luke: 42,
  lk: 42,
  john: 43,
  jn: 43,
  acts: 44,
  ac: 44,
  romans: 45,
  rom: 45,
  rm: 45,
  '1cor': 46,
  '2cor': 47,
  galatians: 48,
  gal: 48,
  ephesians: 49,
  php: 50,
  philippians: 50,
  colossians: 51,
  col: 51,
  '1thess': 52,
  '1th': 52,
  '2thess': 53,
  '2th': 53,
  '1tim': 54,
  '2tim': 55,
  titus: 56,
  philemon: 57,
  philem: 57,
  phm: 57,
  hebrews: 58,
  heb: 58,
  james: 59,
  jas: 59,
  '1pet': 60,
  '1pe': 60,
  '2pet': 61,
  '2pe': 61,
  '1john': 62,
  '1jn': 62,
  '2john': 63,
  '2jn': 63,
  '3john': 64,
  '3jn': 64,
  jude: 65,
  jud: 65,
  revelation: 66,
  rev: 66,
}

const bookInfoById = new Map<number, BookInfo>(
  Object.values(bibleBookMap).map((info) => [info.bookId, info]),
)

const bookLookup: Record<string, BookInfo> = { ...bibleBookMap }
for (const [alias, bookId] of Object.entries(englishBookAliases)) {
  if (!bookLookup[alias]) {
    const info = bookInfoById.get(bookId)
    if (info) bookLookup[alias] = info
  }
}

const ADDRESS_REGEX =
  /^(?<book>(?:[0-9]{1})?[A-Za-z]+)\s+(?<chapter>\d+)(?::(?<verseFrom>\d+)?(?:-(?<verseTo>\d+))?)?$/

type ParsedAddress = {
  bookAbbr: string
  chapter: number
  verseFrom?: number
  verseTo?: number
}

export class BibleDatabase {
  private db: SqlJsDatabase | null = null
  private dbPath: string

  constructor(dbPath: string) {
    this.dbPath = dbPath
  }

  async initialize(): Promise<void> {
    const SQL = await initSqlJs({
      wasmBinary,
    })

    const dbBuffer = fs.readFileSync(this.dbPath)
    const database = new SQL.Database(dbBuffer)

    try {
      const tables = database.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('books', 'verses')",
      )
      if (!tables.length || tables[0].values.length < 2) {
        throw new Error(
          'Invalid scripture database: missing required tables (books, verses)',
        )
      }

      this.db?.close()
      this.db = database
    } catch (err) {
      database.close()
      throw err
    }
  }

  private parseAddress(address: string): ParsedAddress {
    const trimmed = address.trim()
    const match = trimmed.match(ADDRESS_REGEX)

    if (!match) {
      throw new Error(`Invalid bible address: ${address}`)
    }

    const bookAbbr = match.groups?.book
    const chapter = match.groups?.chapter

    if (!bookAbbr || !chapter) {
      throw new Error(`Invalid bible address: ${address}`)
    }

    const verseFrom = match.groups?.verseFrom
      ? Number(match.groups.verseFrom)
      : undefined
    const verseTo = match.groups?.verseTo
      ? Number(match.groups.verseTo)
      : undefined

    return {
      bookAbbr: bookAbbr.toLowerCase(),
      chapter: Number(chapter),
      verseFrom,
      verseTo,
    }
  }

  private buildAddress(
    bookName: string,
    chapter: number,
    verseFrom?: number,
    verseTo?: number,
  ): string {
    if (verseFrom && verseTo) {
      return `${bookName} ${chapter}:${verseFrom}-${verseTo}`
    }
    if (verseFrom) {
      return `${bookName} ${chapter}:${verseFrom}`
    }
    return `${bookName} ${chapter}`
  }

  private getBook(abbr: string): BookInfo {
    const book = bookLookup[abbr.toLowerCase()]
    if (!book) {
      throw new Error(`Invalid book abbreviation: ${abbr}`)
    }
    return book
  }

  isKnownReference(address: string): boolean {
    try {
      const { bookAbbr } = this.parseAddress(address)
      return bookLookup[bookAbbr.toLowerCase()] !== undefined
    } catch {
      return false
    }
  }

  private queryAll(
    sql: string,
    params: (string | number)[],
  ): Record<string, unknown>[] {
    if (!this.db) return []

    const stmt = this.db.prepare(sql)
    stmt.bind(params)
    const rows: Record<string, unknown>[] = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    return rows
  }

  getVerses(query: string): { verses: Verse[]; reference: string } {
    if (!this.db) {
      return { verses: [], reference: '' }
    }

    const { bookAbbr, chapter, verseFrom, verseTo } = this.parseAddress(query)
    const { bookId, bookName } = this.getBook(bookAbbr)

    let rows: Record<string, unknown>[]
    if (verseFrom && verseTo) {
      rows = this.queryAll(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ? AND verse BETWEEN ? AND ?',
        [bookId, chapter, verseFrom, verseTo],
      )
    } else if (verseFrom) {
      rows = this.queryAll(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?',
        [bookId, chapter, verseFrom],
      )
    } else {
      rows = this.queryAll(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ?',
        [bookId, chapter],
      )
    }

    const verses: Verse[] = rows.map((row) => ({
      id: row.id as number,
      book_id: row.book_id as number,
      chapter: row.chapter as number,
      verse: row.verse as number,
      text: row.text as string,
      reference: this.buildAddress(
        bookName.vi,
        row.chapter as number,
        row.verse as number,
      ),
    }))

    const reference = this.buildAddress(
      bookName.vi,
      chapter,
      verseFrom,
      verseTo,
    )

    return { verses, reference }
  }

  getAllBooks(): Book[] {
    return Object.entries(bibleBookMap)
      .map(([abbr, info]) => ({
        id: info.bookId,
        abbreviation: abbr,
        name: info.bookName.vi,
        nameEn: info.bookName.en,
      }))
      .sort((a, b) => a.id - b.id)
  }

  getChapters(bookId: number): number[] {
    const rows = this.queryAll(
      'SELECT DISTINCT chapter FROM verses WHERE book_id = ? ORDER BY chapter',
      [bookId],
    )
    return rows.map((row) => row.chapter as number)
  }

  getVersesByChapter(bookId: number, chapter: number): Verse[] {
    const rows = this.queryAll(
      'SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse',
      [bookId, chapter],
    )
    const book = Object.values(bibleBookMap).find((b) => b.bookId === bookId)
    const bookName = book?.bookName.vi ?? ''
    return rows.map((row) => ({
      id: row.id as number,
      book_id: row.book_id as number,
      chapter: row.chapter as number,
      verse: row.verse as number,
      text: row.text as string,
      reference: this.buildAddress(
        bookName,
        row.chapter as number,
        row.verse as number,
      ),
    }))
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}
