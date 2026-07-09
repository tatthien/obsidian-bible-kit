export const matchTriggerPrefix = (prefix: RegExp, trigger: string) =>
  prefix.test(trigger)
