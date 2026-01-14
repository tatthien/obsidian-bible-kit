# AGENTS.md - Development Guide for AI Coding Agents

This file provides guidelines for AI coding agents working on the Obsidian Bible Kit plugin.

## Project Overview

**Project:** Obsidian Bible Kit  
**Type:** Obsidian Plugin  
**Language:** TypeScript 4.7.4  
**Build Tool:** esbuild 0.17.3  
**Test Framework:** Jest 29.7.0 with ts-jest

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development mode with watch
npm run build        # Type check and production build
npm run version      # Bump version and update manifest
```

### Testing
```bash
npm test             # Run all tests with coverage
npm run test:watch   # Run tests in watch mode

# Run a single test file
npx jest src/helpers/addressMatch.test.ts

# Run a single test suite
npx jest -t "addressMatch"

# Run tests matching a pattern
npx jest --testPathPattern=helpers
```

### Code Quality
```bash
# TypeScript type checking (included in build)
npx tsc --noEmit

# Note: ESLint is installed but not configured
# Consider adding: npx eslint src/**/*.ts
```

## Project Structure

```
src/
├── main.ts                    # Plugin entry point
├── EditorSuggestVerse.ts      # Main suggestion handler
├── SuggestVerse.ts            # Verse rendering class
├── helpers/                   # Pure utility functions
│   ├── addressMatch.ts
│   ├── addressMatch.test.ts
│   ├── matchTriggerPrefix.ts
│   └── matchTriggerPrefix.test.ts
├── settings/                  # Settings UI and helpers
│   ├── BibleKitSettingTab.ts
│   └── helpers.ts
└── types.ts                   # Shared type definitions
```

## Code Style Guidelines

### Import Organization

Order imports as follows:
1. External dependencies (Obsidian, lodash)
2. Internal project modules
3. Relative imports

```typescript
// External dependencies
import { Editor, EditorPosition, Plugin } from 'obsidian'
import { debounce } from 'lodash'

// Internal modules
import BibleKitPlugin from '../main'
import { Verse, BibleKitSettings } from './types'

// Relative imports
import { addressMatch } from './helpers/addressMatch'
```

### Naming Conventions

- **Variables and functions:** `camelCase`
  ```typescript
  const triggerPrefix = '/'
  function renderSuggestion() { }
  ```

- **Classes:** `PascalCase`
  ```typescript
  class SuggestVerse { }
  class EditorSuggestVerse extends EditorSuggest<SuggestVerse> { }
  ```

- **Types and interfaces:** `PascalCase`
  ```typescript
  type Verse = { /* ... */ }
  type BibleKitSettings = { /* ... */ }
  ```

- **Constants:** `SCREAMING_SNAKE_CASE`
  ```typescript
  const DEFAULT_SETTINGS: BibleKitSettings = { }
  const API_URL = 'https://scripture-api.orb.local'
  const ADDRESS_REGEX = /^([1-3]?\s?[A-Za-z]+\.?\s+\d+(?::\d+)?(?:-\d+)?)/
  ```

### TypeScript Usage

**Strict settings are enabled:**
- `noImplicitAny: true`
- `strictNullChecks: true`
- `isolatedModules: true`

**Always use explicit types:**
```typescript
// Good
function addressMatch(address: string): string { }
async getSuggestions(context: EditorSuggestContext): Promise<SuggestVerse[]> { }

// Avoid implicit any
const data = await response.json() as ApiResponse
```

**Prefer `type` over `interface`:**
```typescript
// Preferred
type Verse = {
  id: number
  book_id: number
  chapter: number
  verse: number
  text: string
}

// Use for settings objects
type BibleKitSettings = {
  triggerPrefix: string
  renderFormat: string
}
```

### Error Handling

**Use try-catch for async operations:**
```typescript
async onload() {
  try {
    await this.loadSettings()
    this.registerEditorSuggest(new EditorSuggestVerse(this.app, this))
  } catch (err) {
    console.error('[ERROR]', err)
  }
}
```

**Use defensive programming:**
```typescript
// Null checks and early returns
if (!match) return null
if (!json.verses.length) return []

// Optional chaining
const verse = verses?.find(v => v.id === id)
```

### Testing Patterns

**Test file naming:** Co-locate tests with source files using `.test.ts` suffix
```
src/helpers/addressMatch.ts
src/helpers/addressMatch.test.ts
```

**Test structure:** Use Jest's `describe` and `it` blocks
```typescript
describe('addressMatch', () => {
  it('should match valid bible addresses', () => {
    const testCases = [
      { input: 'Gen 1:1', expected: 'Gen 1:1' },
      { input: 'Gen 1', expected: 'Gen 1' },
      { input: '1 John 2:3', expected: '1 John 2:3' },
    ]
    
    for (const { input, expected } of testCases) {
      expect(addressMatch(input)).toBe(expected)
    }
  })
  
  it('should return empty string for invalid addresses', () => {
    expect(addressMatch('not a verse')).toBe('')
  })
})
```

**Test naming:** Use "should" pattern for descriptive test names

## Class Organization

**Order class members:**
1. Constructor
2. Lifecycle methods (onload, onunload)
3. Public methods
4. Private/protected methods

```typescript
class BibleKitPlugin extends Plugin {
  settings: BibleKitSettings
  
  async onload() { }
  
  async onunload() { }
  
  async loadSettings() { }
  
  async saveSettings() { }
}
```

## Known Issues to Be Aware Of

1. **Typo in function name:** `matchTirggerPrefix` is consistently misspelled (should be `matchTriggerPrefix`)
2. **No ESLint configuration:** ESLint is installed but not configured in the root
3. **Limited test coverage:** Only helper functions have tests; UI components and main plugin lack tests
4. **Hardcoded API URL:** Consider making configurable if needed

## Best Practices

- Keep functions small and focused (prefer pure functions in helpers/)
- Use strict TypeScript settings and avoid `any`
- Write tests for utility functions and business logic
- Use descriptive variable and function names
- Avoid mutating state when possible
- Follow the existing class-based architecture for Obsidian components
- Use Obsidian's API types for editor and plugin interactions
