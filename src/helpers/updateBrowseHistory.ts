import type { BrowseSession } from '../types'

const MAX_BROWSE_HISTORY = 10

export function updateBrowseHistory(
  history: BrowseSession[],
  session: BrowseSession,
): BrowseSession[] {
  return [
    session,
    ...history.filter(
      (item) =>
        item.bookId !== session.bookId || item.chapter !== session.chapter,
    ),
  ].slice(0, MAX_BROWSE_HISTORY)
}

export function removeBrowseHistorySession(
  history: BrowseSession[],
  session: BrowseSession,
): BrowseSession[] {
  return history.filter(
    (item) =>
      item.bookId !== session.bookId || item.chapter !== session.chapter,
  )
}
