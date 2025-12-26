import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from 'obsidian'
import BibleKitPlugin from '../main'
import { matchTirggerPrefix } from './helpers/matchTriggerPrefix'
import { SuggestVerse } from './SuggestVerse'
import { addressMatch } from './helpers/addressMatch'

const API_URL = 'https://scripture-api.orb.local'

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
    if (!matchTirggerPrefix(new RegExp(this.plugin.settings.triggerPrefix), prefixTrigger)) {
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
    const res = await fetch(
      `${API_URL}/verses/${encodeURIComponent(context.query)}`,
    )
    const json = await res.json()

    if (!json.verses.length) return []

    const suggestVerse = new SuggestVerse(json.verses, json.reference)

    return [suggestVerse]
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
