import BibleKitPlugin from '../main'
import { App, PluginSettingTab, Setting } from 'obsidian'

export class BibleKitSettingTab extends PluginSettingTab {
  plugin: BibleKitPlugin

  constructor(app: App, plugin: BibleKitPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Trigger prefix')
      .setDesc('The prefix to trigger the verse suggestion.')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('@@', '@@')
          .addOption('--', '--')
          .setValue(this.plugin.settings.triggerPrefix)
          .onChange((value) => {
            this.plugin.settings.triggerPrefix = value
            this.plugin.saveSettings()
          })
      })
  }
}
