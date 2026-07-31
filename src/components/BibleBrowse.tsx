import { useEffect, useState } from 'react'
import type BibleKitPlugin from '../../main'
import type { Book, Verse } from '../types'

type BibleBrowseProps = {
  plugin: BibleKitPlugin
}

export function BibleBrowse({ plugin }: BibleBrowseProps) {
  const [books] = useState<Book[]>(() => plugin.bibleDb.getAllBooks())
  const [selectedBook, setSelectedBook] = useState<number | null>(null)
  const [chapters, setChapters] = useState<number[]>([])
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedBook) {
      setChapters([])
      setSelectedChapter(null)
      return
    }
    setChapters(plugin.bibleDb.getChapters(selectedBook))
    setSelectedChapter(null)
    setSelectedVerse(null)
  }, [selectedBook, plugin.bibleDb])

  useEffect(() => {
    if (!selectedBook || !selectedChapter) {
      setVerses([])
      setSelectedVerse(null)
      return
    }
    setVerses(plugin.bibleDb.getVersesByChapter(selectedBook, selectedChapter))
    setSelectedVerse(null)
  }, [selectedBook, selectedChapter, plugin.bibleDb])

  const displayedVerses = selectedVerse
    ? verses.filter((v) => v.verse === selectedVerse)
    : verses

  return (
    <div className="bible-browse-view">
      <div className="bible-browse-toolbar">
        <select
          className="dropdown"
          value={selectedBook ?? ''}
          onChange={(e) =>
            setSelectedBook(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Book...</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name}
            </option>
          ))}
        </select>
        <select
          className="dropdown"
          value={selectedChapter ?? ''}
          disabled={!chapters.length}
          onChange={(e) =>
            setSelectedChapter(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Chapter...</option>
          {chapters.map((ch) => (
            <option key={ch} value={ch}>
              {ch}
            </option>
          ))}
        </select>
        <select
          className="dropdown"
          value={selectedVerse ?? ''}
          disabled={!verses.length}
          onChange={(e) =>
            setSelectedVerse(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Verse...</option>
          {verses.map((v) => (
            <option key={v.verse} value={v.verse}>
              {v.verse}
            </option>
          ))}
        </select>
      </div>
      <div className="bible-browse-content">
        {displayedVerses.map((v) => (
          <p key={v.id} className="bible-browse-verse">
            <sup>{v.verse}</sup> {v.text}
          </p>
        ))}
      </div>
    </div>
  )
}
