import { Notice } from 'obsidian'
import { useState } from 'react'
import type BibleKitPlugin from '../../main'
import { formatVerseSelectionReference } from '../helpers/formatVerseSelectionReference'
import { resolveBrowseSelection } from '../helpers/resolveBrowseSelection'
import { SuggestVerse } from '../SuggestVerse'
import type { Book, BrowseSession, Verse } from '../types'
import { BrowseHistory } from './BrowseHistory'
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
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<number>>(
    () => new Set(),
  )
  const [hasCopied, setHasCopied] = useState(false)
  const [chapterOpenRequest, setChapterOpenRequest] = useState<number | null>(
    null,
  )
  const [browseHistory, setBrowseHistory] = useState<BrowseSession[]>(() =>
    plugin.settings.browseHistory.slice(0, 10),
  )

  const handleBookChange = (bookId: number | null) => {
    setSelectedBook(bookId)
    setChapters(bookId ? plugin.bibleDb.getChapters(bookId) : [])
    setSelectedChapter(null)
    setVerses([])
    setSelectedVerseIds(new Set())
    setHasCopied(false)
    if (bookId) {
      setChapterOpenRequest((current) => (current ?? 0) + 1)
    }
  }

  const handleChapterChange = (chapter: number | null) => {
    setSelectedChapter(chapter)
    setVerses(
      selectedBook && chapter
        ? plugin.bibleDb.getVersesByChapter(selectedBook, chapter)
        : [],
    )
    setSelectedVerseIds(new Set())
    setHasCopied(false)

    if (selectedBook && chapter) {
      setBrowseHistory(plugin.recordBrowseSelection(selectedBook, chapter))
    }
  }

  const handleHistorySelect = (session: BrowseSession) => {
    const nextChapters = plugin.bibleDb.getChapters(session.bookId)
    if (!nextChapters.includes(session.chapter)) return

    setSelectedBook(session.bookId)
    setChapters(nextChapters)
    setSelectedChapter(session.chapter)
    setVerses(
      plugin.bibleDb.getVersesByChapter(session.bookId, session.chapter),
    )
    setSelectedVerseIds(new Set())
    setHasCopied(false)
    setBrowseHistory(
      plugin.recordBrowseSelection(session.bookId, session.chapter),
    )
  }

  const handleHistoryRemove = (session: BrowseSession) => {
    setBrowseHistory(plugin.removeBrowseSession(session))
  }

  const toggleVerse = (verseId: number) => {
    setHasCopied(false)
    setSelectedVerseIds((current) => {
      const next = new Set(current)
      if (next.has(verseId)) {
        next.delete(verseId)
      } else {
        next.add(verseId)
      }
      return next
    })
  }

  const selectedVerses = verses.filter((verse) =>
    selectedVerseIds.has(verse.id),
  )
  const selectedReference = formatVerseSelectionReference(selectedVerses)

  const copySelectedVerses = async (): Promise<void> => {
    if (!selectedVerses.length) return

    const suggestion = new SuggestVerse(selectedVerses, selectedReference)
    let content: string

    switch (plugin.settings.renderFormat) {
      case 'callout':
        content = suggestion.callout()
        break
      case 'blockquote':
        content = suggestion.blockquote()
        break
      default:
        content = suggestion.normal()
    }

    try {
      await navigator.clipboard.writeText(content)
      setHasCopied(true)
      new Notice(
        `Bible Kit: Copied ${selectedVerses.length} verse${
          selectedVerses.length === 1 ? '' : 's'
        }`,
      )
    } catch (err) {
      console.error('[BibleKit] Failed to copy verses:', err)
      new Notice('Bible Kit: Failed to copy selected verses')
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
          openRequestKey={chapterOpenRequest}
          placeholder="Chapter..."
          searchPlaceholder="Search chapters..."
          emptyMessage="No chapters found"
          onChange={handleChapterChange}
        />
        <BrowseHistory
          books={books}
          sessions={browseHistory}
          selectedBookId={selectedBook}
          selectedChapter={selectedChapter}
          onSelect={handleHistorySelect}
          onRemove={handleHistoryRemove}
        />
      </div>
      <div
        className={`bible-browse-content${
          selectedVerseIds.size ? ' has-selection' : ''
        }`}
      >
        {verses.map((v) => (
          <label
            key={v.id}
            className={`bible-browse-verse${
              selectedVerseIds.has(v.id) ? ' is-selected' : ''
            }`}
          >
            <input
              className="bible-browse-verse-select"
              type="checkbox"
              checked={selectedVerseIds.has(v.id)}
              aria-label={`Select ${v.reference}`}
              style={{ width: '1px', height: '1px' }}
              onChange={() => toggleVerse(v.id)}
            />
            <span>
              <sup>{v.verse}</sup> {v.text}
            </span>
          </label>
        ))}
      </div>
      {selectedVerses.length > 0 && (
        <div className="bible-browse-copy-panel">
          <div className="bible-browse-copy-reference">
            <span>Currently selected</span>
            <strong>{selectedReference}</strong>
          </div>
          <button
            type="button"
            className="mod-cta"
            onClick={() => void copySelectedVerses()}
          >
            {hasCopied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className="clickable-icon"
            aria-label="Clear verse selection"
            onClick={() => {
              setSelectedVerseIds(new Set())
              setHasCopied(false)
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
