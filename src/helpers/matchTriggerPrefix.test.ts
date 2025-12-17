import { matchTirggerPrefix } from './matchTriggerPrefix'

describe('matchTriggerPrefix', () => {
  it('should match trigger prefix', () => {
    expect(matchTirggerPrefix('@')).toBeTruthy()
  })
})
