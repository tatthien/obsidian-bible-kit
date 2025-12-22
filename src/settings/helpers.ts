import { Plugin } from "obsidian"

export function htmlDescription(innerHTML: string) {
  const desc = new DocumentFragment()
  desc.createSpan({}, span => {
    span.innerHTML = innerHTML
  })
  return desc
}
