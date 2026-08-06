import { useState } from 'react'
import type BibleKitPlugin from '../../main'
import { resolveBrowseSelection } from '../helpers/resolveBrowseSelection'
import type { Book, Verse } from '../types'
import { SearchableSelect } from './SearchableSelect'

type BibleBrowseProps = {
  plugin: BibleKitPlugin
}

export function BibleBrowse({ plugin }: BibleBrowseProps) {
  const [books] = useState<Book[]>(() => plugin.bibleDb.getAllBooks())
  const [initialSelection] = useState(() =>
    resolveBrowseSelection(
      books,
      plugin.settings.lastBrowseBookId,
      plugin.settings.lastBrowseChapter,
      (bookId) => plugin.bibleDb.getChapters(bookId),
    ),
  )
  const [selectedBook, setSelectedBook] = useState<number | null>(
    initialSelection?.bookId ?? null,
  )
  const [chapters, setChapters] = useState<number[]>(() =>
    initialSelection ? plugin.bibleDb.getChapters(initialSelection.bookId) : [],
  )
  const [selectedChapter, setSelectedChapter] = useState<number | null>(
    initialSelection?.chapter ?? null,
  )
  const [verses, setVerses] = useState<Verse[]>(() =>
    initialSelection
      ? plugin.bibleDb.getVersesByChapter(
          initialSelection.bookId,
          initialSelection.chapter,
        )
      : [],
  )

  const handleBookChange = (bookId: number | null) => {
    setSelectedBook(bookId)
    setChapters(bookId ? plugin.bibleDb.getChapters(bookId) : [])
    setSelectedChapter(null)
    setVerses([])
  }

  const handleChapterChange = (chapter: number | null) => {
    setSelectedChapter(chapter)
    setVerses(
      selectedBook && chapter
        ? plugin.bibleDb.getVersesByChapter(selectedBook, chapter)
        : [],
    )

    if (selectedBook && chapter) {
      void plugin.saveBrowseSelection(selectedBook, chapter)
    }
  }

  return (
    <div className="bible-browse-view">
      <div className="bible-browse-toolbar">
        <SearchableSelect
          options={books.map((book) => ({
            value: book.id,
            label: book.name,
          }))}
          value={selectedBook}
          placeholder="Book..."
          searchPlaceholder="Search books..."
          emptyMessage="No books found"
          onChange={handleBookChange}
        />
        <SearchableSelect
          className="bible-chapter-select"
          options={chapters.map((chapter) => ({
            value: chapter,
            label: String(chapter),
          }))}
          value={selectedChapter}
          disabled={!chapters.length}
          placeholder="Chapter..."
          searchPlaceholder="Search chapters..."
          emptyMessage="No chapters found"
          onChange={handleChapterChange}
        />
      </div>
      <div className="bible-browse-content">
        {verses.map((v) => (
          <p key={v.id} className="bible-browse-verse">
            <sup>{v.verse}</sup> {v.text}
          </p>
        ))}
      </div>
    </div>
  )
}
