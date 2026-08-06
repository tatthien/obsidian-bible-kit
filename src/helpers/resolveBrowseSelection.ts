import type { Book } from '../types'

export type BrowseSelection = {
  bookId: number
  chapter: number
}

export function resolveBrowseSelection(
  books: Book[],
  savedBookId: number | null | undefined,
  savedChapter: number | null | undefined,
  getChapters: (bookId: number) => number[],
): BrowseSelection | null {
  const savedBook = books.find((book) => book.id === savedBookId)
  if (
    savedBook &&
    savedChapter !== null &&
    savedChapter !== undefined &&
    getChapters(savedBook.id).includes(savedChapter)
  ) {
    return { bookId: savedBook.id, chapter: savedChapter }
  }

  const genesis = books.find((book) => book.nameEn === 'Genesis')
  if (!genesis) return null

  return { bookId: genesis.id, chapter: 1 }
}
