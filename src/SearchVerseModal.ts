import type { App, Editor } from 'obsidian'
import { SuggestModal } from 'obsidian'
import type BibleKitPlugin from '../main'
import { API_URL } from './api'
import { htmlDescription } from './settings/helpers'
import type { FTSVerse } from './types'

export class SearchVerseModal extends SuggestModal<FTSVerse> {
  plugin: BibleKitPlugin
  editor: Editor

  constructor(app: App, plugin: BibleKitPlugin, editor: Editor) {
    super(app)
    this.plugin = plugin
    this.editor = editor
    this.setPlaceholder('Search verses...')
  }

  async getSuggestions(query: string): Promise<FTSVerse[]> {
    if (!query.trim()) return []

    try {
      const res = await fetch(`${API_URL}/verses/fts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) return []

      const verses: FTSVerse[] = await res.json()
      return verses
    } catch (err) {
      console.error('[SearchVerseModal] Failed to fetch verses:', err)
      return []
    }
  }

  renderSuggestion(verse: FTSVerse, el: HTMLElement): void {
    const container = el.createDiv({ cls: 'fts-suggestion' })
    container.createEl('div', {
      cls: 'fts-suggestion-reference',
      text: `${verse.reference}`,
    })
    container.createEl('small', {
      cls: 'fts-suggestion-text',
      text: htmlDescription(verse.highlighted_text),
    })
  }

  onChooseSuggestion(verse: FTSVerse): void {
    const renderFormat = this.plugin.settings.renderFormat
    const verseContent = `<sup>${verse.verse}</sup> ${verse.text}`

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
