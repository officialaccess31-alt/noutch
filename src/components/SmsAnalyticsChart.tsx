'use client'

import { useState, type PointerEvent } from 'react'
import styled from 'styled-components'
import type { SmsAnalyticsPoint } from '@/lib/api'
import { useLocale } from '@/lib/i18n'
import { theme as t } from '@/lib/theme'

const Card = styled.section`
  margin: 0 0 24px;
  overflow: hidden;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.lg};
  background: ${t.color.white};
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 8px;
  @media (max-width: ${t.mobile}) { padding: 17px 16px 5px; }
`

const Heading = styled.div`
  h2 { margin: 0; color: ${t.color.ink}; font: 600 16px ${t.font.display}; }
  p { margin: 5px 0 0; color: ${t.color.muted}; font-size: 11px; }
`

const ChartWrap = styled.div`
  position: relative;
  width: 100%;
  padding: 7px 15px 15px 10px;
  svg { display: block; width: 100%; height: auto; overflow: visible; }
  @media (max-width: ${t.mobile}) { padding: 8px 8px 12px 3px; }
`

const HoverCard = styled.div`
  position: absolute;
  z-index: 2;
  top: 12px;
  min-width: 150px;
  padding: 10px 12px;
  border: 1px solid #dedede;
  border-radius: 9px;
  background: rgba(255, 255, 255, .97);
  box-shadow: 0 8px 22px rgba(0, 0, 0, .12);
  pointer-events: none;
  strong { display: block; margin-bottom: 7px; color: #171717; font-size: 11px; }
  div { display: flex; justify-content: space-between; gap: 18px; margin-top: 4px; color: #737373; font-size: 10px; }
  b { color: #404040; font-weight: 650; }
`

const activityColor = '#333333'
const chartWidth = 900
const chartHeight = 260
const left = 54
const right = 880
const top = 18
const bottom = 218

function createLine(values: number[], max: number) {
  const points = values.map((value, index) => ({
    x: left + (right - left) * (index / Math.max(values.length - 1, 1)),
    y: bottom - (value / max) * (bottom - top),
  }))
  if (!points.length) return { path: '', points }
  const path = points.reduce((result, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const before = points[index - 2] ?? previous
    const next = points[index + 1] ?? point
    const tension = 0.18
    const cp1x = previous.x + (point.x - before.x) * tension
    const cp1y = previous.y + (point.y - before.y) * tension
    const cp2x = point.x - (next.x - previous.x) * tension
    const cp2y = point.y - (next.y - previous.y) * tension
    return `${result} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`
  }, '')
  return { path, points }
}

function shortNumber(value: number) {
  return value === 0 ? '0' : `${Math.round(value / 1000)}k`
}

export default function SmsAnalyticsChart({ data }: { data: SmsAnalyticsPoint[] }) {
  const { language, t: tr } = useLocale()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState(50)
  const totals = data.map((point) => point.delivered + point.failed + point.pending)
  const maxValue = Math.max(5000, Math.ceil(Math.max(...totals, 0) / 5000) * 5000)
  const activity = createLine(totals, maxValue)
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const activeIndex = pinnedIndex ?? hoveredIndex
  const hovered = activeIndex === null ? null : data[activeIndex]

  function getIndexAtPointer(event: PointerEvent<SVGSVGElement>, requireLineHit: boolean): number | null {
    if (!data.length) return null
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    const verticalRatio = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    const graphStart = left / chartWidth
    const graphWidth = (right - left) / chartWidth
    const graphRatio = Math.max(0, Math.min(1, (ratio - graphStart) / graphWidth))
    const scaledIndex = graphRatio * (data.length - 1)
    const index = Math.max(0, Math.min(data.length - 1, Math.round(scaledIndex)))
    const lowerIndex = Math.floor(scaledIndex)
    const upperIndex = Math.min(data.length - 1, lowerIndex + 1)
    const fraction = scaledIndex - lowerIndex
    const expectedY = activity.points[lowerIndex].y + (activity.points[upperIndex].y - activity.points[lowerIndex].y) * fraction
    const pointerY = verticalRatio * chartHeight
    const distanceToLine = Math.abs(pointerY - expectedY)
    if (requireLineHit && distanceToLine > 22) return null
    setTooltipPosition(Math.max(16, Math.min(84, ratio * 100)))
    return index
  }

  function showAtPointer(event: PointerEvent<SVGSVGElement>) {
    if (pinnedIndex !== null || event.pointerType === 'touch') return
    const index = getIndexAtPointer(event, true)
    setHoveredIndex(index)
  }

  function pinAtPointer(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === 'mouse') return
    const index = getIndexAtPointer(event, false)
    if (index !== null) {
      setPinnedIndex((current) => current === index ? null : index)
      setHoveredIndex(null)
    }
  }

  return (
    <Card>
      <Header>
        <Heading>
          <h2>{tr('SMS activity')}</h2>
          <p>{tr('Daily message activity over the last 7 days')}</p>
        </Heading>
      </Header>
      <ChartWrap>
        {hovered && (
          <HoverCard style={{ left: `${tooltipPosition}%`, transform: tooltipPosition > 72 ? 'translateX(-100%)' : 'translateX(-50%)' }}>
            <strong>{tr(hovered.day)} · {tr('Message summary')}</strong>
            <div><span>{tr('Total activity')}</span><b>{new Intl.NumberFormat(language).format(hovered.delivered + hovered.failed + hovered.pending)}</b></div>
            <div><span>{tr('Delivered')}</span><b>{new Intl.NumberFormat(language).format(hovered.delivered)}</b></div>
            <div><span>{tr('Failed')}</span><b>{new Intl.NumberFormat(language).format(hovered.failed)}</b></div>
            <div><span>{tr('Pending / other')}</span><b>{new Intl.NumberFormat(language).format(hovered.pending)}</b></div>
          </HoverCard>
        )}
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={tr('SMS activity chart. Hover over the line or tap it to see a daily summary.')}
          preserveAspectRatio="none"
          onPointerMove={showAtPointer}
          onPointerDown={pinAtPointer}
          onPointerLeave={() => { if (pinnedIndex === null) setHoveredIndex(null) }}
        >
          {ticks.map((tick) => {
            const y = bottom - tick * (bottom - top)
            return (
              <g key={tick}>
                <line x1={left} y1={y} x2={right} y2={y} stroke="#dedede" strokeWidth="1" />
                <text x={left - 12} y={y + 4} textAnchor="end" fill="#737373" fontSize="10">{shortNumber(maxValue * tick)}</text>
              </g>
            )
          })}
          <path d={activity.path} fill="none" stroke={activityColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={activity.path} fill="none" stroke="transparent" strokeWidth="28" strokeLinecap="round" pointerEvents="stroke" aria-hidden="true" />
          {data.map((point, index) => {
            const x = left + (right - left) * (index / Math.max(data.length - 1, 1))
            return <text key={point.day} x={x} y="247" textAnchor="middle" fill="#737373" fontSize="10">{tr(point.day)}</text>
          })}
        </svg>
      </ChartWrap>
    </Card>
  )
}
