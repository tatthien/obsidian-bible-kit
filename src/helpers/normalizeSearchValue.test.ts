import { normalizeSearchValue } from './normalizeSearchValue'

describe('normalizeSearchValue', () => {
  it('should ignore Vietnamese diacritics', () => {
    expect(normalizeSearchValue('Công-vụ')).toBe('congvu')
  })

  it('should treat spaces and hyphens equally', () => {
    expect(normalizeSearchValue('cong vu')).toBe(
      normalizeSearchValue('cong-vu'),
    )
  })

  it('should preserve letters and numbers', () => {
    expect(normalizeSearchValue('1 Cô-rinh-tô')).toBe('1corinhto')
  })
})
