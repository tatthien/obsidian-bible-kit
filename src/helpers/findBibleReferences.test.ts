import { findBibleReferences } from './findBibleReferences'

describe('findBibleReferences', () => {
  it('should find a single reference in a sentence', () => {
    const matches = findBibleReferences('This is Gen 1:1')
    expect(matches).toEqual([{ text: 'Gen 1:1', start: 8, end: 15 }])
  })

  it('should find multiple references', () => {
    const matches = findBibleReferences('Read gi 3:16 and sa 1:1-2 today')
    expect(matches.map((m) => m.text)).toEqual(['gi 3:16', 'sa 1:1-2'])
  })

  it('should find chapter-only and numbered-book references', () => {
    const matches = findBibleReferences('See 1gi 2 and Thi 23:1')
    expect(matches.map((m) => m.text)).toEqual(['1gi 2', 'Thi 23:1'])
  })

  it('should return empty array when no reference exists', () => {
    expect(findBibleReferences('no verses here')).toEqual([])
    expect(findBibleReferences('')).toEqual([])
  })

  it('should not include trailing punctuation', () => {
    const matches = findBibleReferences('Read (Gen 1:1), then go.')
    expect(matches.map((m) => m.text)).toEqual(['Gen 1:1'])
  })
})
