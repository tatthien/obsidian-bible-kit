import type { Verse } from '../types'
import { formatVerseSelectionReference } from './formatVerseSelectionReference'

function createVerse(verse: number): Verse {
  return {
    id: verse,
    book_id: 1,
    chapter: 1,
    verse,
    text: `Verse ${verse}`,
    reference: `Sáng-thế Ký 1:${verse}`,
  }
}

describe('formatVerseSelectionReference', () => {
  it('should format a single verse', () => {
    expect(formatVerseSelectionReference([createVerse(2)])).toBe(
      'Sáng-thế Ký 1:2',
    )
  })

  it('should combine consecutive verses into ranges', () => {
    expect(
      formatVerseSelectionReference([
        createVerse(1),
        createVerse(2),
        createVerse(3),
      ]),
    ).toBe('Sáng-thế Ký 1:1-3')
  })

  it('should preserve non-consecutive verse groups', () => {
    expect(
      formatVerseSelectionReference([
        createVerse(5),
        createVerse(1),
        createVerse(2),
        createVerse(7),
      ]),
    ).toBe('Sáng-thế Ký 1:1-2, 5, 7')
  })
})
