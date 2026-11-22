'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import styled, { keyframes } from 'styled-components'
import { theme as t } from '@/lib/theme'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'

type Kind = 'success' | 'error' | 'info'
type Item = { id: number; kind: Kind; title: string; message?: string; duration: number }

type ToastApi = {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const COLORS: Record<Kind, { main: string; soft: string }> = {
  success: { main: t.color.okText, soft: t.color.okBg },
  error: { main: '#e5484d', soft: '#fdecec' },
  info: { main: t.color.primary, soft: '#f4f4f5' },
}

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(24px) scale(.98); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
`
const Viewport = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: grid;
  gap: 10px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
`

const Card = styled.div<{ $kind: Kind }>`
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 14px 16px;
  background: ${t.color.white};
  border: 1px solid ${t.color.line};
  border-left: 3px solid ${({ $kind }) => COLORS[$kind].main};
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
  font-family: ${t.font.body};
  animation: ${slideIn} 0.25s ease-out;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const IconWrap = styled.div<{ $kind: Kind }>`
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${({ $kind }) => COLORS[$kind].soft};
  color: ${({ $kind }) => COLORS[$kind].main};
  svg { width: 18px; height: 18px; stroke-width: 2; }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`
const Title = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111111;
  line-height: 1.3;
`
const Message = styled.div`
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.45;
  color: #737373;
  word-break: break-word;
`
const Close = styled.button`
  flex: none;
  border: 0;
  background: transparent;
  color: #a3a3a3;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  line-height: 0;
  &:hover {
    background: #f4f4f5;
    color: #404040;
  }
  svg { width: 14px; height: 14px; stroke-width: 2.2; }
`
function Icon({ kind }: { kind: Kind }) {
  if (kind === 'success') return <FiCheckCircle aria-hidden="true" />
  if (kind === 'error') return <FiAlertCircle aria-hidden="true" />
  return <FiInfo aria-hidden="true" />
}

function ToastCard({ item, onClose }: { item: Item; onClose: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(item.id), item.duration)
    return () => clearTimeout(timer)
  }, [item, onClose])

  return (
    <Card $kind={item.kind} role={item.kind === 'error' ? 'alert' : 'status'}>
      <IconWrap $kind={item.kind}><Icon kind={item.kind} /></IconWrap>
      <Body>
        <Title>{item.title}</Title>
        {item.message && <Message>{item.message}</Message>}
      </Body>
      <Close type="button" aria-label="Dismiss notification" onClick={() => onClose(item.id)}>
        <FiX aria-hidden="true" />
      </Close>
    </Card>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const nextId = useRef(1)

  const close = useCallback((id: number) => setItems((cur) => cur.filter((x) => x.id !== id)), [])

  const push = useCallback((kind: Kind, title: string, message?: string) => {
    const duration = kind === 'error' ? 6500 : 4500
    setItems((cur) => {
      const alreadyVisible = cur.some(
        (item) => item.kind === kind && item.title === title && item.message === message
      )
      if (alreadyVisible) return cur
      return [...cur.slice(-2), { id: nextId.current++, kind, title, message, duration }]
    })
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Viewport aria-live="polite">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={close} />
        ))}
      </Viewport>
    </ToastContext.Provider>
  )
}
