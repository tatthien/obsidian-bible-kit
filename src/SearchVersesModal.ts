import type { App, Editor } from 'obsidian'
import { SuggestModal } from 'obsidian'
import type BibleKitPlugin from '../main'
import { htmlDescription } from './settings/helpers'
import type { Verse } from './types'

export class SearchVersesModal extends SuggestModal<Verse> {
  plugin: BibleKitPlugin
  editor: Editor

  constructor(app: App, plugin: BibleKitPlugin, editor: Editor) {
    super(app)
    this.plugin = plugin
    this.editor = editor
    this.setPlaceholder('Search verses...')
  }

  async getSuggestions(query: string): Promise<Verse[]> {
    if (!query.trim()) return []

    try {
      const { verses } = this.plugin.bibleDb.getVerses(query)
      if (!verses.length) return []

      const result: Verse = { ...verses[0] }
      result.text = verses
        .map((v) => `<sup>${v.verse}</sup> ${v.text}`)
        .join(' ')

      return [result]
    } catch (err) {
      console.error('[SearchVerseModal] Failed to get verses:', err)
      return []
    }
  }

  renderSuggestion(verse: Verse, el: HTMLElement): void {
    const container = el.createDiv({ cls: 'fts-suggestion' })
    container.createEl('div', {
      cls: 'fts-suggestion-reference',
      text: htmlDescription(verse.text),
    })
  }

  onChooseSuggestion(verse: Verse): void {
    const renderFormat = this.plugin.settings.renderFormat
    const verseContent = `${verse.text}`

    let content = ''
    switch (renderFormat) {
      case 'callout':
        content = `> [!bible]+ ${verse.reference}\n> ${verseContent}`
        break
      case 'blockquote':
        content = `> ${verseContent}`
        break
      default:
        content = verseContent
    }

    this.editor.replaceSelection(content)
  }
}
