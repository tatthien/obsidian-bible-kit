import { Verse } from "./types";

export class SuggestVerse {
  private address: string
  private verses: Verse[]

  constructor(verses: Verse[], address: string) {
    this.address = address
    this.verses = verses
  }

  renderSuggestion(): string {
    return this.htmlVerses()
  }

  callout(): string {
    const header = `> [!bible]+ ${this.address}\n`
    const content = `> ${this.htmlVerses()}`
    return header + content
  }

  blockquote(): string {
    return `> ${this.htmlVerses()}`
  }

  normal(): string {
    return this.htmlVerses()
  }

  htmlVerses(): string {
    return this.verses
      .map((verse: Verse) => `<sup>${verse.verse}</sup> ${verse.text}`)
      .join(' ')
  }
}
