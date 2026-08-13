import {
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { normalizeSearchValue } from '../helpers/normalizeSearchValue'

export type SearchableSelectOption = {
  value: number
  label: string
}

type SearchableSelectProps = {
  className?: string
  options: SearchableSelectOption[]
  value: number | null
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  disabled?: boolean
  openRequestKey?: number | null
  onChange: (value: number | null) => void
}

export function SearchableSelect({
  className,
  options,
  value,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  openRequestKey,
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query.trim())
    if (!normalizedQuery) return options

    return options.filter((option) =>
      normalizeSearchValue(option.label).includes(normalizedQuery),
    )
  }, [options, query])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    searchInputRef.current?.focus()

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (openRequestKey === null || openRequestKey === undefined || disabled) {
      return
    }

    setQuery('')
    setHighlightedIndex(0)
    setIsOpen(true)
  }, [openRequestKey, disabled])

  const openMenu = () => {
    if (disabled) return

    setQuery('')
    setHighlightedIndex(0)
    setIsOpen(true)
  }

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
  }

  const highlightOption = (index: number) => {
    setHighlightedIndex(index)
    requestAnimationFrame(() => {
      document
        .getElementById(`${listboxId}-${filteredOptions[index]?.value}`)
        ?.scrollIntoView({ block: 'nearest' })
    })
  }

  const selectOption = (option: SearchableSelectOption) => {
    onChange(option.value)
    closeMenu(true)
    setQuery('')
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu(true)
      return
    }

    if (!filteredOptions.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      highlightOption(
        Math.min(highlightedIndex + 1, filteredOptions.length - 1),
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      highlightOption(Math.max(highlightedIndex - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const option = filteredOptions[highlightedIndex]
      if (option) selectOption(option)
    }
  }

  return (
    <div
      className={`bible-searchable-select${className ? ` ${className}` : ''}`}
      ref={containerRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className="dropdown bible-searchable-select-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
      >
        <span className={!selectedOption ? 'is-placeholder' : undefined}>
          {selectedOption?.label ?? placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="suggestion-container bible-searchable-select-menu">
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              aria-controls={listboxId}
              aria-expanded={isOpen}
              aria-label={searchPlaceholder}
              aria-activedescendant={
                filteredOptions[highlightedIndex]
                  ? `${listboxId}-${filteredOptions[highlightedIndex].value}`
                  : undefined
              }
              role="combobox"
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value)
                setHighlightedIndex(0)
              }}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div
            id={listboxId}
            className="suggestion bible-searchable-select-options"
            role="listbox"
          >
            {filteredOptions.map((option, index) => (
              <div
                id={`${listboxId}-${option.value}`}
                key={option.value}
                className={`suggestion-item${
                  index === highlightedIndex ? ' is-selected' : ''
                }`}
                role="option"
                tabIndex={-1}
                aria-selected={option.value === value}
                onMouseEnter={() => setHighlightedIndex(index)}
                onPointerDown={() => selectOption(option)}
              >
                {option.label}
              </div>
            ))}

            {!filteredOptions.length && (
              <div className="suggestion-item is-disabled">{emptyMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
