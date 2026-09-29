# Obsidian Plugin registration APIs

Reference for the three `Plugin` methods used together in `registerBibleHover`
(`src/BibleHover.ts:243-248`). All three auto-unregister when the plugin
unloads, so you never need manual cleanup.

## registerMarkdownPostProcessor

**Description:** Registers a callback that runs against every rendered Markdown
block in Reading view. The callback receives the block's root `HTMLElement`
(and a render context) and may rewrite its DOM in place.

**When to use it:** Decorating or replacing content in Reading view only, such
as wrapping detected Bible references in styled spans. It does not run in Live
Preview / Source mode. Keep the callback fast (one pass per block) and skip
code elements (`CODE`, `PRE`) so code samples are untouched.

**Example:** underline every `TODO` in Reading view with a tooltip showing its
line context.

```ts
plugin.registerMarkdownPostProcessor((el) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node: Node | null = walker.nextNode()
  while (node) {
    const parent = (node as Text).parentElement
    if (parent && !['CODE', 'PRE', 'SCRIPT'].includes(parent.tagName)) {
      nodes.push(node as Text)
    }
    node = walker.nextNode()
  }

  for (const textNode of nodes) {
    const text = textNode.textContent ?? ''
    const index = text.indexOf('TODO')
    if (index === -1) continue

    const fragment = document.createDocumentFragment()
    fragment.appendText(text.slice(0, index))
    const badge = document.createElement('span')
    badge.addClass('todo-badge')
    badge.setAttribute('title', text.trim())
    badge.setText('TODO')
    fragment.appendChild(badge)
    fragment.appendText(text.slice(index + 4))
    textNode.replaceWith(fragment)
  }
})
```

## registerEditorExtension

**Description:** Registers a CodeMirror 6 extension for the editor. This is the
only way to affect Live Preview / Source mode (decorations, tooltips,
keymaps). The `@codemirror/*` packages are marked external in
`esbuild.config.mjs`, so they are provided by Obsidian at runtime and must be
imported, not bundled.

**When to use it:** Anything visual or interactive while editing. Two common
patterns are shown below: live decorations and hover tooltips. Pass a single
extension or an array; Obsidian merges them into the editor configuration.

**Example 1:** red wavy underline under the word `FIXME` as you type.

```ts
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, ViewPlugin } from '@codemirror/view'

const fixmeHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = this.build(view)
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.build(update.view)
      }
    }
    build(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>()
      for (const { from, to } of view.visibleRanges) {
        const text = view.state.sliceDoc(from, to)
        let index = text.indexOf('FIXME')
        while (index !== -1) {
          builder.add(
            from + index,
            from + index + 5,
            Decoration.mark({ class: 'fixme-underline' }),
          )
          index = text.indexOf('FIXME', index + 5)
        }
      }
      return builder.finish()
    }
  },
  { decorations: (v) => v.decorations },
)

plugin.registerEditorExtension(fixmeHighlighter)
```

**Example 2:** hover tooltip that explains an abbreviation under the cursor.

```ts
import { hoverTooltip } from '@codemirror/view'

const GLOSSARY: Record<string, string> = {
  KJV: 'King James Version (1611)',
  VIE: 'Vietnamese 1925 translation',
}

plugin.registerEditorExtension(
  hoverTooltip((view, pos) => {
    const word = view.state.wordAt(pos)
    if (!word) return null
    const term = view.state.sliceDoc(word.from, word.to)
    const definition = GLOSSARY[term]
    if (!definition) return null
    return {
      pos: word.from,
      end: word.to,
      above: true,
      create: () => {
        const dom = document.createElement('div')
        dom.addClass('glossary-tooltip')
        dom.setText(definition)
        return { dom }
      },
    }
  }),
)
```

## register

**Description:** Registers a cleanup callback that Obsidian invokes on plugin
unload. It accepts any `() => any` function and runs callbacks in reverse
registration order.

**When to use it:** Tearing down anything the other methods do not own:
timers, floating DOM appended to `document.body`, open database handles,
in-flight requests. (Prefer `registerDomEvent` / `registerInterval` where
they fit; `register` is the escape hatch for everything else.)

**Example 1:** remove a floating tooltip (the Reading-view tooltip in
`BibleHover.ts` lives on `document.body`, outside any editor lifecycle).

```ts
plugin.register(hideBibleTooltip)
```

**Example 2:** cancel a periodic background sync and abort pending fetches.

```ts
const controller = new AbortController()
const timer = window.setInterval(() => void syncNotes(controller.signal), 60_000)

plugin.register(() => {
  window.clearInterval(timer)
  controller.abort()
})
```
