import { ItemView, type WorkspaceLeaf } from 'obsidian'
import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type BibleKitPlugin from '../main'
import { BibleBrowse } from './components/BibleBrowse'

export const VIEW_TYPE_BIBLE_BROWSE = 'bible-browse-view'

export class BibleBrowseView extends ItemView {
  plugin: BibleKitPlugin
  root: Root | null = null
  private renderVersion = 0

  constructor(leaf: WorkspaceLeaf, plugin: BibleKitPlugin) {
    super(leaf)
    this.plugin = plugin
  }

  getViewType(): string {
    return VIEW_TYPE_BIBLE_BROWSE
  }

  getDisplayText(): string {
    return 'Browse Scripture'
  }

  getIcon(): string {
    return 'book-open'
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement
    container.empty()
    this.root = createRoot(container)
    this.renderContent()
  }

  refresh(): void {
    this.renderVersion += 1
    this.renderContent()
  }

  private renderContent(): void {
    if (!this.root) return

    this.root.render(
      <StrictMode>
        <BibleBrowse key={this.renderVersion} plugin={this.plugin} />
      </StrictMode>,
    )
  }

  async onClose() {
    this.root?.unmount()
    this.root = null
  }
}
