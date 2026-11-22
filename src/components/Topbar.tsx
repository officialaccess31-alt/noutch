'use client'

import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { FiActivity, FiChevronDown, FiGlobe, FiHelpCircle, FiMenu } from 'react-icons/fi'
import Link from 'next/link'
import styled from 'styled-components'
import { theme as t } from '@/lib/theme'
import { nav } from '@/lib/nav'
import { getCreditBalance } from '@/lib/api'
import { languages, useLocale } from '@/lib/i18n'
import { useHydrated } from '@/hooks/useHydrated'

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  height: 68px;
  background: ${t.color.white};
  border-bottom: 1px solid ${t.color.line};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 42px;
  @media (max-width: ${t.drawer}) {
    padding: 0 24px;
  }
  @media (max-width: ${t.mobile}) {
    height: 58px;
    padding: 0 12px;
  }
`
const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`
const MenuButton = styled.button`
  display: none;
  width: 44px;
  height: 44px;
  flex: none;
  border: 0;
  border-radius: ${t.radius.sm};
  background: transparent;
  color: ${t.color.ink};
  cursor: pointer;
  place-items: center;
  transition: background 0.18s ease;
  &:hover {
    background: ${t.color.paper};
  }
  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
  @media (max-width: ${t.drawer}) {
    display: grid;
  }
`
const Crumb = styled.div`
  font-size: 12px;
  color: ${t.color.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  b {
    color: #171717;
    font-weight: 600;
  }
`
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: ${t.color.muted};
  flex: none;
  @media (max-width: ${t.drawer}) { gap: 8px; }
`

const CreditPill = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid #c8e7d8;
  border-radius: 8px;
  background: #edf8f2;
  color: #246548;
  white-space: nowrap;
  font-size: 11px;
  text-decoration: none;
  cursor: pointer;
  span { color: #527966; }
  strong { color: #126b48; font-size: 12px; font-weight: 700; }
  @media (max-width: ${t.mobile}) {
    min-height: 32px;
    padding: 0 8px;
    gap: 4px;
    font-size: 10px;
    span { display: none; }
  }
`

type SpeedTone = 'low' | 'medium' | 'high'

const InfrastructureSpeed = styled.div<{ $tone: SpeedTone }>`
  min-width: 118px;
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  column-gap: 7px;
  padding: 0 12px;
  border-left: 1px solid #dedede;
  border-right: 1px solid #dedede;
  color: #525252;
  svg { width: 15px; height: 15px; color: ${({ $tone }) => ($tone === 'low' ? '#dc2626' : $tone === 'medium' ? '#d97706' : '#15803d')}; transition: color .5s ease; }
  strong { color: ${({ $tone }) => ($tone === 'low' ? '#dc2626' : $tone === 'medium' ? '#b45309' : '#15803d')}; font-size: 11px; font-weight: 700; transition: color .5s ease; }
  .speed-label { grid-column: 2; font-size: 9px; line-height: 1.2; white-space: nowrap; }
  .speed-track { grid-column: 2 / 4; width: 100%; height: 3px; margin-top: 4px; overflow: hidden; border-radius: 4px; background: ${({ $tone }) => ($tone === 'low' ? '#fee2e2' : $tone === 'medium' ? '#fef3c7' : '#dcfce7')}; transition: background .5s ease; }
  .speed-fill { display: block; height: 100%; border-radius: inherit; background: ${({ $tone }) => ($tone === 'low' ? '#dc2626' : $tone === 'medium' ? '#d97706' : '#15803d')}; transition: width .7s ease, background .5s ease; }
  @media (max-width: ${t.mobile}) {
    min-width: 0;
    display: flex;
    gap: 5px;
    padding: 0 5px;
    border: 0;
    svg { width: 14px; height: 14px; }
    .speed-label, .speed-track { display: none; }
    strong { font-size: 10px; }
  }
`

const LanguageWrap = styled.div`
  position: relative;
`

const LanguageButton = styled.button`
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: ${t.color.muted};
  font: 600 12px ${t.font.body};
  cursor: pointer;
  &:hover { background: ${t.color.paper}; color: ${t.color.ink}; }
  &:focus-visible { outline: 2px solid #737373; outline-offset: 2px; }
  svg { width: 14px; height: 14px; }
  .mobile-icon { display: none; }
  @media (max-width: ${t.mobile}) {
    width: 38px;
    padding: 0;
    .desktop-code, .chevron { display: none; }
    .mobile-icon { display: block; width: 19px; height: 19px; }
  }
`

const LanguageMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 60;
  width: 164px;
  padding: 5px;
  border: 1px solid ${t.color.line};
  border-radius: 10px;
  background: ${t.color.white};
  box-shadow: 0 12px 30px rgba(0, 0, 0, .14);
`

const LanguageOption = styled.button<{ $active: boolean }>`
  width: 100%;
  min-height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? '#f4f4f5' : 'transparent')};
  color: ${({ $active }) => ($active ? '#262626' : '#525252')};
  font: 500 12px ${t.font.body};
  text-align: left;
  cursor: pointer;
  &:hover { background: #f7f7f7; }
  svg { width: 14px; height: 14px; }
`
const Status = styled.span`
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  @media (max-width: 1024px) {
    display: none;
  }
`
const Dot = styled.span`
  height: 7px;
  width: 7px;
  border-radius: 50%;
  background: #22bd91;
  box-shadow: 0 0 0 3px #e1f7f0;
`
const Help = styled(Link)`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid #2c2c2c;
  border-radius: 7px;
  padding: 0 12px;
  min-height: 44px;
  background: ${t.color.sidebar};
  color: ${t.color.white};
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease;
  &:hover {
    background: ${t.color.sidebarHover};
  }
  &:focus-visible { outline: 2px solid #737373; outline-offset: 2px; }
  @media (max-width: ${t.mobile}) {
    display: none;
  }
`

const MobileHelp = styled(Link)`
  display: none;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid #2c2c2c;
  border-radius: 8px;
  background: ${t.color.sidebar};
  color: ${t.color.white};
  cursor: pointer;
  text-decoration: none;
  svg { width: 18px; height: 18px; }
  @media (max-width: ${t.mobile}) { display: grid; }
`

export default function Topbar({ open, onMenu }: { open: boolean; onMenu: () => void }) {
  const { language, setLanguage, t: tr } = useLocale()
  const [balanceGbp, setBalanceGbp] = useState<number>(0.06)
  const [infrastructureSpeed, setInfrastructureSpeed] = useState(78)
  const speedTone: SpeedTone = infrastructureSpeed < 55 ? 'low' : infrastructureSpeed < 80 ? 'medium' : 'high'
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const currentLanguage = languages.find((item) => item.code === language) ?? languages[0]

  useEffect(() => {
    const interval = window.setInterval(() => {
      setInfrastructureSpeed((current) => {
        const next = Math.floor(Math.random() * 62) + 38
        return next === current ? Math.max(38, Math.min(99, next + (next < 69 ? 3 : -3))) : next
      })
    }, 2600)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let active = true
    const refreshBalance = async () => {
      try {
        const result = await getCreditBalance()
        if (active && result && Number.isFinite(result.balanceGbp)) setBalanceGbp(result.balanceGbp)
      } catch {
        // Keep the last known amount visible if the balance service is temporarily unavailable.
      }
    }
    void refreshBalance()
    const interval = window.setInterval(() => void refreshBalance(), 60_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [])

  useEffect(() => {
    if (!languageOpen) return
    const closeOnOutside = (event: PointerEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setLanguageOpen(false) }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [languageOpen])

  const formattedBalance = balanceGbp === null
    ? '£—'
    : new Intl.NumberFormat(language, { style: 'currency', currency: 'GBP' }).format(balanceGbp)

  return (
    <Bar>
      <Left>
        <MenuButton type="button" onClick={onMenu} aria-label="Open menu" aria-expanded={open} aria-controls="sidebar">
          <FiMenu aria-hidden="true" />
        </MenuButton>
        <Suspense fallback={<Crumb>Dashboard</Crumb>}>
          <CurrentCrumb />
        </Suspense>
      </Left>
      <Right>
        <Status>
          <Dot />
          {tr('All systems operational')}
        </Status>
        <InfrastructureSpeed $tone={speedTone} aria-label={`${tr('Infrastructure speed')}: ${infrastructureSpeed}%`} title={tr('Infrastructure speed')}>
          <FiActivity aria-hidden="true" />
          <span className="speed-label">{tr('Infrastructure speed')}</span>
          <strong>{infrastructureSpeed}%</strong>
          <span className="speed-track" aria-hidden="true"><span className="speed-fill" style={{ width: `${infrastructureSpeed}%` }} /></span>
        </InfrastructureSpeed>
          <CreditPill href="/credits" aria-label={`${tr('Credits remaining')}: ${formattedBalance}`} title={tr('Credits remaining')}>
          <span>{tr('Credits')}</span><strong>{formattedBalance}</strong>
        </CreditPill>
        <LanguageWrap ref={languageRef}>
          <LanguageButton type="button" aria-label={tr('Choose language')} aria-expanded={languageOpen} onClick={() => setLanguageOpen((value) => !value)}>
            <span className="desktop-code">{currentLanguage.short}</span>
            <FiGlobe className="mobile-icon" aria-hidden="true" />
            <FiChevronDown className="chevron" aria-hidden="true" />
          </LanguageButton>
          {languageOpen && (
            <LanguageMenu role="menu" aria-label={tr('Choose language')}>
              {languages.map((item) => (
                <LanguageOption key={item.code} type="button" role="menuitemradio" aria-checked={language === item.code} $active={language === item.code} onClick={() => { setLanguage(item.code); setLanguageOpen(false) }}>
                  {item.name}{language === item.code && <span>{item.short}</span>}
                </LanguageOption>
              ))}
            </LanguageMenu>
          )}
        </LanguageWrap>
        <Help href="/community">{tr('Help & support')}</Help>
        <MobileHelp href="/community" aria-label={tr('Open help and support')} title={tr('Open help and support')}><FiHelpCircle aria-hidden="true" /></MobileHelp>
      </Right>
    </Bar>
  )
}

function CurrentCrumb() {
  const pathname = usePathname() ?? ''
  const { t: tr } = useLocale()
  const mounted = useHydrated()
  const current = mounted ? nav.find((n) => pathname === n.href || pathname.startsWith(n.href + '/')) : undefined
  return (
    <Crumb>{tr('Dashboard')} &nbsp;/&nbsp; <b>{current ? tr(current.title) : ''}</b></Crumb>
  )
}
