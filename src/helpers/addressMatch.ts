const ADDRESS_REGEX = /^(?<book>(?:[0-9]{1})?[A-Za-z]+)\s+(?<chapter>\d+)(?::(?<verseFrom>\d+)?(?:-(?<verseTo>\d+))?)?$/;

export const addressMatch = (address: string) => {
  const match = address.match(ADDRESS_REGEX)
  if (match) {
    return match[0]
  }
  return ''
}
