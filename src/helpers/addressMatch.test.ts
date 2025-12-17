import { addressMatch } from './addressMatch'

describe('addressMatch', () => {
  it('should match address', () => {
    const inputs = [
      {
        address: 'Gen 1:1',
        expected: 'Gen 1:1',
      },
      {
        address: 'Gen 1',
        expected: 'Gen 1',
      },
      {
        address: 'Gen 1:1-2',
        expected: 'Gen 1:1-2',
      },
      {
        address: '1Co 1:1',
        expected: '1Co 1:1',
      },
    ]

    for (const input of inputs) {
      expect(addressMatch(input.address)).toBe(input.expected)
    }
  })
})
