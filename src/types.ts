export type Verse = {
  id: number
  book_id: number
  chapter: number
  verse: number
  text: string
}

// Full-text search result (includes rank for relevance sorting)
export type FTSVerse = Verse & {
  rank: number
  reference: string
}
