import { Notice, Plugin } from 'obsidian'
import { BibleDatabase } from './src/BibleDatabase'
import { EditorSuggestVerse } from './src/EditorSuggestVerse'
import { FullTextSearchModal } from './src/FullTextSearchModal'
import { SearchVersesModal } from './src/SearchVersesModal'
import { BibleKitSettingTab } from './src/settings/BibleKitSettingTab'

type BibleKitSettings = {
  triggerPrefix: string
  renderFormat: string
  bibleDbPath: string
}

const DEFAULT_SETTINGS: BibleKitSettings = {
  triggerPrefix: '--',
  renderFormat: 'callout',
  bibleDbPath: '',
}

export default class BibleKitPlugin extends Plugin {
  settings: BibleKitSettings
  bibleDb: BibleDatabase

  async onload() {
    try {
      await this.loadSettings()

      const vaultPath =
        (this.app.vault.adapter as any).getBasePath?.() ||
        (this.app.vault.adapter as any).basePath
      const pluginDir = `${vaultPath}/.obsidian/plugins/${this.manifest.id}`
      this.bibleDb = new BibleDatabase(this.settings.bibleDbPath, pluginDir)
      await this.initializeBibleDb()

      this.registerEditorSuggest(new EditorSuggestVerse(this))

      this.addSettingTab(new BibleKitSettingTab(this.app, this))

      this.addCommand({
        id: 'full-text-search',
        name: 'Full-text search',
        editorCallback: (editor) => {
          new FullTextSearchModal(this.app, this, editor).open()
        },
      })

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

  private async initializeBibleDb() {
    if (!this.settings.bibleDbPath) {
      new Notice(
        'Bible Kit: Please configure a scripture database path in settings',
      )
      return
    }

    try {
      await this.bibleDb.initialize()
      new Notice('Bible Kit: Scripture database loaded successfully')
    } catch (err) {
      console.error('[BibleKit] Failed to initialize Bible database:', err)
      new Notice(
        `Bible Kit: Failed to open scripture database at ${this.settings.bibleDbPath}`,
      )
    }
  }

  async updateBibleDbPath(path: string) {
    this.settings.bibleDbPath = path
    await this.saveSettings()

    this.bibleDb.close()
    const vaultPath =
      (this.app.vault.adapter as any).getBasePath?.() ||
      (this.app.vault.adapter as any).basePath
    const pluginDir = `${vaultPath}/.obsidian/plugins/${this.manifest.id}`
    this.bibleDb = new BibleDatabase(path, pluginDir)
    await this.initializeBibleDb()
  }

  onunload() {
    if (this.bibleDb) {
      this.bibleDb.close()
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
