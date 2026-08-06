import type { Verse } from '../types'

function formatVerseRanges(verseNumbers: number[]): string {
  const ranges: string[] = []
  let rangeStart = verseNumbers[0]
  let rangeEnd = rangeStart

  for (const verseNumber of verseNumbers.slice(1)) {
    if (rangeEnd !== undefined && verseNumber === rangeEnd + 1) {
      rangeEnd = verseNumber
      continue
    }

    if (rangeStart !== undefined && rangeEnd !== undefined) {
      ranges.push(
        rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
      )
    }
    rangeStart = verseNumber
    rangeEnd = verseNumber
  }

  if (rangeStart !== undefined && rangeEnd !== undefined) {
    ranges.push(
      rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
    )
  }

  return ranges.join(', ')
}

export function formatVerseSelectionReference(verses: Verse[]): string {
  if (!verses.length) return ''

  const sortedVerses = [...verses].sort((a, b) => a.verse - b.verse)
  const chapterReference = sortedVerses[0].reference.replace(/:\d+$/, '')
  const verseRanges = formatVerseRanges(
    sortedVerses.map((verse) => verse.verse),
  )

  return `${chapterReference}:${verseRanges}`
}
