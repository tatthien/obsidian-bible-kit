import { RangeSetBuilder } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  hoverTooltip,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view'
import type BibleKitPlugin from '../main'
import { findBibleReferences } from './helpers/findBibleReferences'

let activeTooltip: HTMLElement | null = null
let activeTarget: HTMLElement | null = null

export function hideBibleTooltip(): void {
  activeTooltip?.remove()
  activeTooltip = null
  activeTarget = null
}

function buildTooltipContent(
  plugin: BibleKitPlugin,
  ref: string,
): HTMLElement | null {
  let verses: { verse: number; text: string }[] = []
  let reference = ref

  try {
    const result = plugin.bibleDb.getVerses(ref)
    if (!result.verses.length) return null
    verses = result.verses
    reference = result.reference || ref
  } catch {
    return null
  }

  const container = document.createElement('div')
  container.addClass('bible-hover-tooltip-content')

  const header = document.createElement('div')
  header.addClass('bible-hover-tooltip-reference')
  header.setText(reference)
  container.appendChild(header)

  const body = document.createElement('div')
  body.addClass('bible-hover-tooltip-verses')
  for (const verse of verses) {
    const line = document.createElement('div')
    line.addClass('bible-hover-tooltip-verse')
    const num = document.createElement('sup')
    num.setText(String(verse.verse))
    line.appendChild(num)
    line.appendText(` ${verse.text}`)
    body.appendChild(line)
  }
  container.appendChild(body)

  return container
}

function positionTooltip(target: HTMLElement, tooltip: HTMLElement): void {
  const rect = target.getBoundingClientRect()
  tooltip.style.position = 'fixed'
  tooltip.style.visibility = 'hidden'
  document.body.appendChild(tooltip)

  const width = tooltip.offsetWidth
  const height = tooltip.offsetHeight
  const margin = 8

  let left = rect.left + rect.width / 2 - width / 2
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))

  let top = rect.bottom + margin
  if (top + height > window.innerHeight - margin) {
    top = rect.top - height - margin
  }
  if (top < margin) top = margin

  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
  tooltip.style.visibility = ''
}

function showBibleTooltip(target: HTMLElement, plugin: BibleKitPlugin): void {
  const ref = target.getAttribute('data-ref')
  if (!ref) return
  if (activeTarget === target && activeTooltip) return

  hideBibleTooltip()
  const content = buildTooltipContent(plugin, ref)
  if (!content) return

  const tooltip = document.createElement('div')
  tooltip.addClass('bible-hover-tooltip')
  tooltip.appendChild(content)
  activeTooltip = tooltip
  activeTarget = target
  positionTooltip(target, tooltip)
}

function attachHoverListeners(span: HTMLElement, plugin: BibleKitPlugin): void {
  span.addEventListener('mouseenter', () => showBibleTooltip(span, plugin))
  span.addEventListener('mouseleave', () => {
    if (activeTarget === span) hideBibleTooltip()
  })
}

const SKIP_TAGS = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE'])

function processReadingView(el: HTMLElement, plugin: BibleKitPlugin): void {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  let node: Node | null = walker.nextNode()
  while (node) {
    const textNode = node as Text
    const parent = textNode.parentElement
    if (
      parent &&
      !SKIP_TAGS.has(parent.tagName) &&
      !parent.closest('.bible-ref, .cm-inline-code')
    ) {
      textNodes.push(textNode)
    }
    node = walker.nextNode()
  }

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? ''
    if (!text) continue

    const matches = findBibleReferences(text).filter((m) =>
      plugin.bibleDb.isKnownReference(m.text),
    )
    if (!matches.length) continue

    const fragment = document.createDocumentFragment()
    let cursor = 0
    for (const m of matches) {
      if (m.start > cursor) {
        fragment.appendText(text.slice(cursor, m.start))
      }
      const span = document.createElement('span')
      span.addClass('bible-ref')
      span.setAttribute('data-ref', m.text)
      span.setText(m.text)
      attachHoverListeners(span, plugin)
      fragment.appendChild(span)
      cursor = m.end
    }
    if (cursor < text.length) {
      fragment.appendText(text.slice(cursor))
    }
    textNode.replaceWith(fragment)
  }
}

function bibleRefDecorations(plugin: BibleKitPlugin) {
  return ViewPlugin.fromClass(
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
      build(view: EditorView): DecorationSet {
        const widgets: { from: number; to: number; ref: string }[] = []
        for (const { from, to } of view.visibleRanges) {
          let pos = from
          while (pos <= to) {
            const line = view.state.doc.lineAt(pos)
            const matches = findBibleReferences(line.text).filter((m) =>
              plugin.bibleDb.isKnownReference(m.text),
            )
            for (const m of matches) {
              widgets.push({
                from: line.from + m.start,
                to: line.from + m.end,
                ref: m.text,
              })
            }
            pos = line.to + 1
          }
        }
        widgets.sort((a, b) => a.from - b.from)
        const builder = new RangeSetBuilder<Decoration>()
        for (const w of widgets) {
          builder.add(
            w.from,
            w.to,
            Decoration.mark({
              class: 'bible-ref',
              attributes: { 'data-ref': w.ref },
            }),
          )
        }
        return builder.finish()
      }
    },
    { decorations: (v) => v.decorations },
  )
}

function bibleHoverTooltip(plugin: BibleKitPlugin) {
  return hoverTooltip((view, pos) => {
    const line = view.state.doc.lineAt(pos)
    const rel = pos - line.from
    const match = findBibleReferences(line.text).find(
      (m) => m.start <= rel && rel <= m.end,
    )
    if (!match || !plugin.bibleDb.isKnownReference(match.text)) return null

    const ref = match.text
    const start = line.from + match.start
    const end = line.from + match.end

    return {
      pos: start,
      end,
      above: true,
      create: () => {
        const dom = document.createElement('div')
        dom.addClass('bible-hover-tooltip')
        const content = buildTooltipContent(plugin, ref)
        if (content) {
          dom.appendChild(content)
        } else {
          dom.setText('No verses found')
        }
        return { dom }
      },
    }
  })
}

export function registerBibleHover(plugin: BibleKitPlugin): void {
  plugin.registerMarkdownPostProcessor((el) => processReadingView(el, plugin))
  plugin.registerEditorExtension([
    bibleRefDecorations(plugin),
    bibleHoverTooltip(plugin),
  ])
  plugin.register(hideBibleTooltip)
}
