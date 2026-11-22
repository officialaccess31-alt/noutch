'use client'

import Link from 'next/link'
import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { FiChevronDown } from 'react-icons/fi'
import { theme as t } from '@/lib/theme'
import { useLocale } from '@/lib/i18n'

/* ---------- Layout ---------- */

export const Content = styled.section`
  animation: content-enter 220ms cubic-bezier(.2, .8, .2, 1) both;
  @keyframes content-enter {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  max-width: 1380px;
  margin: auto;
  padding: 38px 42px 60px;
  @media (max-width: ${t.drawer}) {
    padding: 28px 24px 48px;
  }
  @media (max-width: ${t.mobile}) {
    padding: 24px 16px 40px;
  }
`

/* ---------- Page header ---------- */

const HeaderRow = styled.div<{ $center: boolean }>`
  display: flex;
  justify-content: ${({ $center }) => ($center ? 'center' : 'space-between')};
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 27px;
  ${({ $center }) => $center && css`> div { text-align: center; }`}
`
const Eyebrow = styled.div`
  color: ${t.color.muted};
  text-transform: uppercase;
  letter-spacing: 1.3px;
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 8px;
`
const Title = styled.h1`
  font: 600 30px ${t.font.display};
  letter-spacing: -1px;
  margin: 0 0 7px;
  @media (max-width: ${t.mobile}) {
    font-size: 26px;
  }
`
const Subtitle = styled.p`
  color: ${t.color.muted};
  font-size: 13px;
  margin: 0;
`

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow = 'Workspace',
  align = 'left',
}: {
  title: string
  subtitle: string
  action?: React.ReactNode
  eyebrow?: string
  align?: 'left' | 'center'
}) {
  const { t: tr } = useLocale()
  return (
    <HeaderRow $center={align === 'center'}>
      <div>
        {eyebrow && <Eyebrow>{tr(eyebrow)}</Eyebrow>}
        <Title>{tr(title)}</Title>
        <Subtitle>{tr(subtitle)}</Subtitle>
      </div>
      {action}
    </HeaderRow>
  )
}

/* ---------- Buttons ---------- */

const buttonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  background: ${t.color.primary};
  color: ${t.color.white};
  border: 0;
  border-radius: ${t.radius.sm};
  font: 600 13px ${t.font.body};
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
  &:hover {
    background: #262626;
  }
  &:active {
    transform: scale(0.98);
  }
`
export const Button = styled(Link)`
  ${buttonStyle}
`
export const ActionButton = styled.button`
  ${buttonStyle}
`

/* ---------- Metric cards ---------- */

export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 25px;
`
const MetricBox = styled.div`
  background: ${t.color.white};
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.md};
  padding: 18px 20px;
`
const MetricLabel = styled.div`
  font-size: 11px;
  color: ${t.color.muted};
  margin-bottom: 8px;
`
const MetricValue = styled.div`
  font: 600 24px ${t.font.display};
  letter-spacing: -0.7px;
`

export function Metric({ label, value }: { label: string; value: string }) {
  const { t: tr } = useLocale()
  return (
    <MetricBox>
      <MetricLabel>{tr(label)}</MetricLabel>
      <MetricValue>{value}</MetricValue>
    </MetricBox>
  )
}

/* ---------- Panel + Table ---------- */

const PanelBox = styled.div`
  background: ${t.color.white};
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.lg};
  overflow: hidden;
`
const PanelHead = styled.div<{ $center: boolean }>`
  padding: 20px 22px;
  border-bottom: 1px solid ${t.color.line};
  text-align: ${({ $center }) => ($center ? 'center' : 'left')};
`
const PanelTitle = styled.h2`
  font: 600 16px ${t.font.display};
  margin: 0;
`
const PanelSub = styled.p`
  font-size: 11px;
  color: ${t.color.muted};
  margin: 5px 0 0;
`

export function Panel({
  title,
  subtitle,
  children,
  align = 'left',
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  align?: 'left' | 'center'
}) {
  const { t: tr } = useLocale()
  return (
    <PanelBox>
      <PanelHead $center={align === 'center'}>
        <PanelTitle>{tr(title)}</PanelTitle>
        {subtitle && <PanelSub>{tr(subtitle)}</PanelSub>}
      </PanelHead>
      {children}
    </PanelBox>
  )
}

const Scroll = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`
const StyledTable = styled.table`
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  text-align: left;

  th {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${t.color.muted};
    font-weight: 600;
    background: ${t.color.tableHead};
    padding: 12px 22px;
    white-space: nowrap;
  }
  td {
    padding: 15px 22px;
    border-top: 1px solid #dedede;
    font-size: 12px;
    color: #525252;
    white-space: nowrap;
  }
  tbody tr {
    transition: background 0.18s ease;
  }
  tbody tr:hover {
    background: ${t.color.tableHead};
  }
`

export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  const { t: tr } = useLocale()
  return (
    <Scroll>
      <StyledTable>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{tr(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </StyledTable>
    </Scroll>
  )
}

export const EmptyRow = styled.td`
  text-align: center;
  color: ${t.color.muted} !important;
  padding: 32px 22px !important;
`

/* ---------- Status chip ---------- */

type Tone = 'ok' | 'warn' | 'muted'
const tones: Record<Tone, { color: string; bg: string }> = {
  ok: { color: t.color.okText, bg: t.color.okBg },
  warn: { color: '#8a5a12', bg: '#fff4e2' },
  muted: { color: '#737373', bg: '#f0f2f6' },
}

export const Chip = styled.span<{ $tone?: Tone }>`
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 600;
  color: ${({ $tone = 'ok' }) => tones[$tone].color};
  background: ${({ $tone = 'ok' }) => tones[$tone].bg};
`

/* ---------- Loading skeleton ---------- */

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`
export const Skeleton = styled.div<{ $h?: string; $w?: string }>`
  height: ${({ $h = '20px' }) => $h};
  width: ${({ $w = '100%' }) => $w};
  max-width: 100%;
  border-radius: ${t.radius.sm};
  background: linear-gradient(90deg, #f4f4f5 25%, #f7f7f7 50%, #f4f4f5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`
/* ---------- Accordion (FAQ) ---------- */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`
export const Accordion = styled.div`
  display: grid;
  width: 100%;
  max-width: 900px;
  gap: 12px;
`
const AccordionItemBox = styled.details`
  background: ${t.color.white};
  border: 1px solid ${t.color.line};
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .025);
  transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
  &:hover { border-color: #d4d4d4; box-shadow: 0 5px 16px rgba(0, 0, 0, .045); }
  &[open] { border-color: #bdbdbd; box-shadow: 0 8px 24px rgba(0, 0, 0, .06); }

  summary {
    list-style: none;
    cursor: pointer;
    min-height: 70px;
    padding: 17px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    color: #171717;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    transition: background .18s ease, color .18s ease;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary:hover {
    background: #fafafa;
  }
  summary:focus-visible { outline: 2px solid #737373; outline-offset: -3px; }
  summary svg {
    flex: none;
    width: 17px;
    height: 17px;
    color: #737373;
    transition: transform .25s ease, color .18s ease;
  }
  &[open] summary svg {
    transform: rotate(180deg);
    color: ${t.color.primary};
  }
  p {
    margin: 0;
    padding: 17px 24px 21px;
    border-top: 1px solid ${t.color.line};
    font-size: 13px;
    line-height: 1.75;
    color: #525252;
    animation: ${fadeIn} 0.25s ease;
  }
  @media (max-width: ${t.mobile}) {
    summary { min-height: 64px; padding: 13px 14px; gap: 11px; font-size: 13px; }
    p { padding: 14px 16px 17px; font-size: 12px; line-height: 1.7; }
  }
`

export function AccordionItem({ children, ...props }: ComponentProps<'details'>) {
  const content = Children.toArray(children)
  const first = content.shift()
  const title = isValidElement(first)
    ? (first.props as { children?: ReactNode }).children
    : first

  return (
    <AccordionItemBox {...props}>
      <summary>{title}<FiChevronDown aria-hidden="true" /></summary>
      {content}
    </AccordionItemBox>
  )
}

const PanelBodyBox = styled.div`
  padding: 22px;
`

export function PanelBody({ children }: { children: React.ReactNode }) {
  return <PanelBodyBox>{children}</PanelBodyBox>
}

/* ---------- Forms ---------- */

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  @media (max-width: ${t.mobile}) {
    grid-template-columns: 1fr;
  }
`

export const Field = styled.div`
  margin-bottom: 18px;
`

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #404040;
`

const controlStyle = css`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.sm};
  background: ${t.color.white};
  color: #404040;
  font: 13px ${t.font.body};
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  &:focus {
    border-color: ${t.color.primary};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.11);
  }
`

export const Select = styled.select`
  ${controlStyle}
  height: 44px;
  padding: 0 12px;
`

export const Textarea = styled.textarea`
  ${controlStyle}
  min-height: 112px;
  resize: vertical;
  padding: 12px;
  line-height: 1.5;
`

export const Hint = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 7px;
  color: ${t.color.muted};
  font-size: 10px;
`

export const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 18px;
  color: #525252;
  font-size: 12px;
  cursor: pointer;
`

export const SubmitButton = styled.button`
  ${buttonStyle}
  min-width: 120px;
  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`

export const Notice = styled.div<{ $tone: 'ok' | 'error' }>`
  margin-top: 14px;
  border-radius: ${t.radius.sm};
  padding: 11px 12px;
  font-size: 12px;
  color: ${({ $tone }) => ($tone === 'ok' ? t.color.okText : '#9b2c2c')};
  background: ${({ $tone }) => ($tone === 'ok' ? t.color.okBg : '#fdecec')};
`

/* ---------- Details and paging ---------- */

export const DetailList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  row-gap: 0;

  dt, dd {
    margin: 0;
    padding: 14px 0;
    border-bottom: 1px solid ${t.color.line};
  }
  dt {
    color: ${t.color.muted};
    font-size: 12px;
  }
  dd {
    color: #404040;
    font-size: 12px;
  }
  dt:last-of-type, dd:last-child {
    border-bottom: 0;
  }
  @media (max-width: ${t.mobile}) {
    grid-template-columns: 110px minmax(0, 1fr);
  }
`

export const Truncate = styled.span`
  display: inline-block;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
`

const PagerRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 22px;
  border-top: 1px solid ${t.color.line};
`

export function Pager({ page, hasMore, basePath }: { page: number; hasMore: boolean; basePath: string }) {
  return (
    <PagerRow>
      {page > 1 && (
        <Button href={`${basePath}?page=${page - 1}`}>Previous</Button>
      )}
      {hasMore && (
        <Button href={`${basePath}?page=${page + 1}`}>Next</Button>
      )}
    </PagerRow>
  )
}
