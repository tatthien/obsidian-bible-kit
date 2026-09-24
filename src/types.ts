export type Book = {
  id: number
  abbreviation: string
  name: string
  nameEn: string
}

export type BrowseSession = {
  bookId: number
  chapter: number
}

export type Verse = {
  id: number
  book_id: number
  chapter: number
  verse: number
  text: string
  reference: string
}
