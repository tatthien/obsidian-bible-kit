import { setIcon } from 'obsidian'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import type { Book, BrowseSession } from '../types'

type BrowseHistoryProps = {
  books: Book[]
  sessions: BrowseSession[]
  selectedBookId: number | null
  selectedChapter: number | null
  onSelect: (session: BrowseSession) => void
  onRemove: (session: BrowseSession) => void
}

export function BrowseHistory({
  books,
  sessions,
  selectedBookId,
  selectedChapter,
  onSelect,
  onRemove,
}: BrowseHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const validSessions = sessions.filter((session) =>
    books.some((book) => book.id === session.bookId),
  )

  useEffect(() => {
    if (triggerRef.current) setIcon(triggerRef.current, 'history')
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return

    event.preventDefault()
    closeMenu(true)
  }

  return (
    <div className="bible-browse-history" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="clickable-icon bible-browse-history-trigger"
        aria-label="Browsing history"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      />

      {isOpen && (
        <div className="suggestion-container bible-browse-history-menu">
          <div
            className="suggestion bible-browse-history-options"
            role="listbox"
            onKeyDown={handleMenuKeyDown}
          >
            {validSessions.map((session) => {
              const book = books.find((item) => item.id === session.bookId)
              if (!book) return null
              const isSelected =
                session.bookId === selectedBookId &&
                session.chapter === selectedChapter

              return (
                <div
                  key={`${session.bookId}-${session.chapter}`}
                  className={`suggestion-item${
                    isSelected ? ' is-selected' : ''
                  }`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  onPointerDown={() => {
                    onSelect(session)
                    closeMenu(true)
                  }}
                >
                  <span className="bible-browse-history-label">
                    {book.name} {session.chapter}
                  </span>
                  <button
                    type="button"
                    className="clickable-icon bible-browse-history-remove"
                    aria-label={`Remove ${book.name} ${session.chapter} from history`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onRemove(session)}
                  >
                    ×
                  </button>
                </div>
              )
            })}

            {!validSessions.length && (
              <div className="suggestion-item is-disabled">No sessions</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
