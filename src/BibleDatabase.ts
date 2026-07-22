import * as fs from 'fs'
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'
import wasmBinary from 'sql.js/dist/sql-wasm.wasm'
import type { Book, FTSVerse, Verse } from './types'

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
    this.db = new SQL.Database(dbBuffer)

    const tables = this.db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('books', 'verses')",
    )
    if (!tables.length || tables[0].values.length < 2) {
      throw new Error(
        'Invalid scripture database: missing required tables (books, verses)',
      )
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
    const book = bibleBookMap[abbr.toLowerCase()]
    if (!book) {
      throw new Error(`Invalid book abbreviation: ${abbr}`)
    }
    return book
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

  searchVerses(query: string): FTSVerse[] {
    if (!this.db) {
      return []
    }

    const sanitized = query.replace(/[.,!@#$%^&*()-]/g, '')

    try {
      const rows = this.queryAll(
        `SELECT v.id, v.book_id, v.chapter, v.verse, v.text,
                highlight(verses_fts, 1, '<b>', '</b>') as highlighted_text,
                rank
         FROM verses AS v
         INNER JOIN verses_fts AS s ON s.row_id = v.id
         WHERE verses_fts MATCH ?
         ORDER BY rank`,
        [sanitized],
      )

      return rows.map((row) => {
        const book = Object.values(bibleBookMap).find(
          (b) => b.bookId === (row.book_id as number),
        )
        const reference = book
          ? this.buildAddress(
              book.bookName.vi,
              row.chapter as number,
              row.verse as number,
            )
          : `${row.chapter}:${row.verse}`

        return {
          id: row.id as number,
          book_id: row.book_id as number,
          chapter: row.chapter as number,
          verse: row.verse as number,
          text: row.text as string,
          reference,
          rank: row.rank as number,
          highlighted_text: row.highlighted_text as string,
        }
      })
    } catch {
      return []
    }
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
