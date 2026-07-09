import { matchTriggerPrefix } from './matchTriggerPrefix'

describe('matchTriggerPrefix', () => {
  it('should match trigger prefix', () => {
    const regex = /@@/
    expect(matchTriggerPrefix(regex, '@@')).toBeTruthy()
  })
})
