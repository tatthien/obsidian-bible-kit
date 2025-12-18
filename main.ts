import { Plugin } from 'obsidian'
import { EditorSuggestVerse } from './src/EditorSuggestVerse'
import { BibleKitSettingTab } from './src/BibleKitSettingTab'

type BibleKitSettings = {
  triggerPrefix: string
  renderFormat: string
}

const DEFAULT_SETTINGS: BibleKitSettings = {
  triggerPrefix: '@@',
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
    } catch (err) {
      console.error('[ERROR]', err)
    }
  }

  onunload() { }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
