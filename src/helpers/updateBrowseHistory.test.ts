import type { BrowseSession } from '../types'
import {
  removeBrowseHistorySession,
  updateBrowseHistory,
} from './updateBrowseHistory'

describe('updateBrowseHistory', () => {
  it('should add the newest session first', () => {
    expect(
      updateBrowseHistory([{ bookId: 1, chapter: 1 }], {
        bookId: 2,
        chapter: 3,
      }),
    ).toEqual([
      { bookId: 2, chapter: 3 },
      { bookId: 1, chapter: 1 },
    ])
  })

  it('should move a repeated session to the front', () => {
    expect(
      updateBrowseHistory(
        [
          { bookId: 1, chapter: 1 },
          { bookId: 2, chapter: 3 },
        ],
        { bookId: 2, chapter: 3 },
      ),
    ).toEqual([
      { bookId: 2, chapter: 3 },
      { bookId: 1, chapter: 1 },
    ])
  })

  it('should keep at most ten sessions', () => {
    const history: BrowseSession[] = Array.from({ length: 10 }, (_, index) => ({
      bookId: index + 1,
      chapter: 1,
    }))

    expect(
      updateBrowseHistory(history, { bookId: 66, chapter: 1 }),
    ).toHaveLength(10)
    expect(updateBrowseHistory(history, { bookId: 66, chapter: 1 })[0]).toEqual(
      { bookId: 66, chapter: 1 },
    )
  })

  it('should remove a session', () => {
    expect(
      removeBrowseHistorySession(
        [
          { bookId: 1, chapter: 1 },
          { bookId: 2, chapter: 3 },
        ],
        { bookId: 1, chapter: 1 },
      ),
    ).toEqual([{ bookId: 2, chapter: 3 }])
  })
})
