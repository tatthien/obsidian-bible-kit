import BibleKitPlugin from '../../main'
import { App, PluginSettingTab, Setting } from 'obsidian'
import { htmlDescription } from './helpers'

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
      .setDesc('The prefix to trigger the verses suggestion. For instance, when typing `--sa 1:1` will trigger the suggestion for Sáng-Thế Ký 1:1.')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('--', '--')
          .addOption('@@', '@@')
          .setValue(this.plugin.settings.triggerPrefix)
          .onChange((value) => {
            this.plugin.settings.triggerPrefix = value
            this.plugin.saveSettings()
          })
      })

    new Setting(containerEl)
      .setName('Render format')
      .setDesc(
        htmlDescription(`The verses render format. See <a href="https://help.obsidian.md/callouts">Callouts documentation</a> for details.`)
      )
      .addDropdown((dropdown) => {
        dropdown
          .addOption('callout', 'Callout')
          .addOption('blockquote', 'Blockquote')
          .addOption('normal', 'Normal')
          .setValue(this.plugin.settings.renderFormat)
          .onChange((value) => {
            this.plugin.settings.renderFormat = value
            this.plugin.saveSettings()
          })
      })
  }
}
