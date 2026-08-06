import type { Book } from '../types'
import { resolveBrowseSelection } from './resolveBrowseSelection'

const books: Book[] = [
  { id: 1, abbreviation: 'sa', name: 'Sáng-thế Ký', nameEn: 'Genesis' },
  { id: 2, abbreviation: 'xu', name: 'Xuất Ê-díp-tô Ký', nameEn: 'Exodus' },
]

const getChapters = (bookId: number): number[] =>
  bookId === 1 ? [1, 2] : [1, 2, 3]

describe('resolveBrowseSelection', () => {
  it('should restore a valid saved book and chapter', () => {
    expect(resolveBrowseSelection(books, 2, 3, getChapters)).toEqual({
      bookId: 2,
      chapter: 3,
    })
  })

  it('should fall back to Genesis chapter 1 for a missing selection', () => {
    expect(resolveBrowseSelection(books, null, null, getChapters)).toEqual({
      bookId: 1,
      chapter: 1,
    })
  })

  it('should fall back to Genesis chapter 1 for an invalid selection', () => {
    expect(resolveBrowseSelection(books, 2, 4, getChapters)).toEqual({
      bookId: 1,
      chapter: 1,
    })
  })
})
