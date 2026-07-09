import { Plugin } from 'obsidian'
import { EditorSuggestVerse } from './src/EditorSuggestVerse'
import { FullTextSearchModal } from './src/FullTextSearchModal'
import { SearchVersesModal } from './src/SearchVersesModal'
import { BibleKitSettingTab } from './src/settings/BibleKitSettingTab'

type BibleKitSettings = {
  triggerPrefix: string
  renderFormat: string
}

const DEFAULT_SETTINGS: BibleKitSettings = {
  triggerPrefix: '--',
  renderFormat: 'callout',
}

export default class BibleKitPlugin extends Plugin {
  settings: BibleKitSettings

  async onload() {
    try {
      await this.loadSettings()

      this.registerEditorSuggest(new EditorSuggestVerse(this))

      // This adds a settings tab so the user can configure various aspects of the plugin
      this.addSettingTab(new BibleKitSettingTab(this.app, this))

      // Add command to search verses via full-text search
      this.addCommand({
        id: 'full-text-search',
        name: 'Full-text search',
        editorCallback: (editor) => {
          new FullTextSearchModal(this.app, this, editor).open()
        },
      })

      // Add command to search verses via address
      this.addCommand({
        id: 'search-verses',
        name: 'Search verses',
        editorCallback: (editor) => {
          new SearchVersesModal(this.app, this, editor).open()
        },
      })
    } catch (err) {
      console.error('[ERROR]', err)
    }
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
