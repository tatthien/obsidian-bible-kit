import {
  type Editor,
  type EditorPosition,
  EditorSuggest,
  type EditorSuggestContext,
  type EditorSuggestTriggerInfo,
  type TFile,
} from 'obsidian'
import type BibleKitPlugin from '../main'
import { addressMatch } from './helpers/addressMatch'
import { matchTriggerPrefix } from './helpers/matchTriggerPrefix'
import { SuggestVerse } from './SuggestVerse'

export class EditorSuggestVerse extends EditorSuggest<SuggestVerse> {
  plugin: BibleKitPlugin

  constructor(plugin: BibleKitPlugin) {
    super(plugin.app)
    this.plugin = plugin
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _: TFile | null,
  ): EditorSuggestTriggerInfo | null {
    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch)

    if (currentContent.length < 1) {
      return null
    }

    const prefixTrigger = currentContent.substring(0, 2)
    if (
      !matchTriggerPrefix(
        new RegExp(this.plugin.settings.triggerPrefix),
        prefixTrigger,
      )
    ) {
      return null
    }

    const queryContent = currentContent.substring(2).trim()
    const match = addressMatch(queryContent)

    if (!match) return null

    return {
      end: cursor,
      start: {
        line: cursor.line,
        ch: queryContent.lastIndexOf(match),
      },
      query: match,
    }
  }

  async getSuggestions(context: EditorSuggestContext): Promise<SuggestVerse[]> {
    try {
      const { verses, reference } = this.plugin.bibleDb.getVerses(context.query)

      if (!verses.length) return []

      const suggestVerse = new SuggestVerse(verses, reference)

      return [suggestVerse]
    } catch (err) {
      console.error('[EditorSuggestVerse] Failed to get verses:', err)
      return []
    }
  }

  renderSuggestion(value: SuggestVerse, el: HTMLElement): void {
    const wrapper = el.createDiv()
    wrapper.innerHTML = value.renderSuggestion()
  }

  selectSuggestion(value: SuggestVerse, evt: MouseEvent | KeyboardEvent): void {
    const renderFormat = this.plugin.settings.renderFormat
    let content = ''

    switch (renderFormat) {
      case 'callout':
        content = value.callout()
        break
      case 'blockquote':
        content = value.blockquote()
        break
      default:
        content = value.htmlVerses()
    }

    if (this.context) {
      this.context.editor.replaceRange(
        content,
        this.context.start,
        this.context.end,
      )
    }
  }
}
