'use client'

import { useId, useState } from 'react'
import styled from 'styled-components'
import { theme as t } from '@/lib/theme'

const Wrap = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
`
const Label = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #171717;
`
const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`
const Value = styled.code`
  flex: 1 1 220px;
  min-width: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: ${t.color.paper};
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.sm};
  font: 13px ${t.font.body};
  white-space: nowrap;
  overflow-x: auto;
`
const SmallButton = styled.button`
  min-height: 44px;
  min-width: 76px;
  padding: 0 14px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.sm};
  background: ${t.color.white};
  color: #404040;
  font: 600 13px ${t.font.body};
  cursor: pointer;
  transition: background 0.18s ease;
  &:hover {
    background: ${t.color.paper};
  }
`

export default function CopyField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const id = useId()
  const [shown, setShown] = useState(!secret)
  const [copied, setCopied] = useState(false)

  const display = shown ? value : '•'.repeat(24) + value.slice(-4)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard needs https or localhost; the value can still be selected by hand
    }
  }

  return (
    <Wrap>
      <Label id={id}>{label}</Label>
      <Row>
        <Value aria-labelledby={id}>{display}</Value>
        {secret && (
          <SmallButton type="button" onClick={() => setShown((s) => !s)}>
            {shown ? 'Hide' : 'Show'}
          </SmallButton>
        )}
        <SmallButton type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </SmallButton>
      </Row>
    </Wrap>
  )
}
