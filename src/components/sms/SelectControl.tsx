'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import styled from 'styled-components'
import { FiChevronDown } from 'react-icons/fi'
import { theme as t } from '@/lib/theme'
import type { Option } from '@/lib/api'

const Root = styled.div`
  position: relative;
  width: 100%;
`

const Trigger = styled.button<{ $invalid: boolean; $open: boolean }>`
  width: 100%;
  min-height: 44px;
  padding: 0 38px 0 12px;
  border: 1px solid ${({ $invalid }) => ($invalid ? '#e5484d' : t.color.line)};
  border-radius: ${t.radius.sm};
  background: ${t.color.white};
  color: #404040;
  font: 13px ${t.font.body};
  text-align: left;
  cursor: pointer;
  position: relative;
  transition: border-color 0.18s ease;
  &:hover:not(:disabled) {
    border-color: #a3a3a3;
  }
  &:focus-visible {
    outline: 2px solid #737373;
    outline-offset: 1px;
    border-color: ${t.color.primary};
  }
  &:disabled {
    color: ${t.color.muted};
    background: #f7f7f7;
    cursor: not-allowed;
  }
  svg {
    position: absolute;
    right: 14px;
    top: 50%;
    width: 16px;
    height: 16px;
    color: #737373;
    transform: translateY(-50%) rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
    transition: transform 0.18s ease;
    pointer-events: none;
  }
`

const Menu = styled.div`
  position: absolute;
  z-index: 30;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.sm};
  background: ${t.color.white};
`

const Item = styled.div<{ $active: boolean; $selected: boolean }>`
  min-height: 38px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 5px;
  color: ${({ $selected }) => ($selected ? '#262626' : '#404040')};
  background: ${({ $active, $selected }) =>
    $active ? '#f4f4f5' : $selected ? '#fafafa' : 'transparent'};
  font: ${({ $selected }) => ($selected ? '600' : '400')} 13px ${t.font.body};
  cursor: pointer;
  &:hover {
    background: #f4f4f5;
  }
`

type Props = {
  id: string
  value: string
  options: Option[]
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  emptyLabel?: string
  onChange: (value: string) => void
}

export default function SelectControl({
  id,
  value,
  options,
  disabled = false,
  invalid = false,
  describedBy,
  emptyLabel = 'Choose an option',
  onChange,
}: Props) {
  const uid = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0))
  const selected = options[selectedIndex]
  const listId = `${uid}-listbox`

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  function showMenu(index = selectedIndex >= 0 ? selectedIndex : 0) {
    setActiveIndex(index)
    setOpen(true)
  }

  function choose(index: number) {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setOpen(false)
    trigger.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || options.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) showMenu()
      else setActiveIndex((index) => (index + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) showMenu()
      else setActiveIndex((index) => (index - 1 + options.length) % options.length)
    } else if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveIndex(options.length - 1)
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      choose(activeIndex)
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <Root ref={root}>
      <Trigger
        ref={trigger}
        id={id}
        type="button"
        disabled={disabled}
        $invalid={invalid}
        $open={open}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-option-${activeIndex}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : showMenu())}
        onKeyDown={onKeyDown}
      >
        {selected?.label ?? (options.length === 0 ? 'No options available' : emptyLabel)}
        <FiChevronDown aria-hidden="true" />
      </Trigger>
      {open && options.length > 0 && (
        <Menu id={listId} role="listbox" aria-labelledby={id}>
          {options.map((option, index) => (
            <Item
              id={`${listId}-option-${index}`}
              key={`${option.value}-${index}`}
              role="option"
              aria-selected={option.value === value}
              $selected={option.value === value}
              $active={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              {option.label}
            </Item>
          ))}
        </Menu>
      )}
    </Root>
  )
}
