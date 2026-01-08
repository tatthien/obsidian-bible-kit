import { matchTirggerPrefix } from './matchTriggerPrefix'

describe('matchTriggerPrefix', () => {
  it('should match trigger prefix', () => {
    const regex = new RegExp('@@')
    expect(matchTirggerPrefix(regex, '@@')).toBeTruthy()
  })
})
