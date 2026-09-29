export type BibleReferenceMatch = {
  text: string
  start: number
  end: number
}

const HOVER_REF_REGEX =
  /(?:^|(?<=[\s(["'“‘]))(?<ref>(?:[1-3]\s?)?[A-Za-z]+\.?\s+\d+(?::\d+(?:-\d+)?)?)(?=[\s).,;:"'!?“”’\])]|$)/g

export function findBibleReferences(text: string): BibleReferenceMatch[] {
  const matches: BibleReferenceMatch[] = []
  HOVER_REF_REGEX.lastIndex = 0

  for (;;) {
    const match = HOVER_REF_REGEX.exec(text)
    if (match === null) break
    const ref = match.groups?.ref
    if (!ref) continue
    const full = match[0]
    const offset = full.lastIndexOf(ref)
    const start = match.index + offset
    matches.push({ text: ref, start, end: start + ref.length })
  }

  return matches
}
