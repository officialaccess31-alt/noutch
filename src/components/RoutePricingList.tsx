'use client'

import styled, { css, keyframes } from 'styled-components'
import { FiInfo } from 'react-icons/fi'
import type { RouteItem } from '@/lib/api'
import { localizeCountry, useLocale } from '@/lib/i18n'
import { theme as t } from '@/lib/theme'

const Note = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: -8px 0 18px;
  padding: 12px 14px;
  border: 1px solid ${t.color.line};
  border-radius: 9px;
  background: #ffffff;
  color: #525252;
  font-size: 12px;
  line-height: 1.5;
  svg { width: 16px; height: 16px; flex: none; margin-top: 1px; color: #525252; }
`

const onlinePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 3px #e6f6f0, 0 0 0 0 rgba(53, 173, 136, 0); }
  50% { opacity: .62; box-shadow: 0 0 0 3px #e6f6f0, 0 0 0 5px rgba(53, 173, 136, .14); }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 18px;
  @media (max-width: 1050px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 620px) { grid-template-columns: 1fr; padding: 12px; gap: 9px; }
`

const Card = styled.article`
  min-width: 0;
  display: grid;
  gap: 13px;
  padding: 14px;
  border: 1px solid ${t.color.line};
  border-radius: 10px;
  background: ${t.color.white};
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
  &:hover { border-color: #d4d4d4; box-shadow: 0 5px 16px rgba(0, 0, 0, .055); transform: translateY(-1px); }
`

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Flag = styled.span`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 9px;
  background: #f7f7f7;
  font-size: 20px;
  line-height: 1;
`

const Country = styled.h3`
  min-width: 0;
  margin: 0;
  color: ${t.color.ink};
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -.1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Availability = styled.span<{ $online: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex: none;
  color: ${({ $online }) => ($online ? '#28755f' : '#8a5960')};
  font-size: 10px;
  font-weight: 600;
  &:before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $online }) => ($online ? '#35ad88' : '#c66772')};
    box-shadow: 0 0 0 3px ${({ $online }) => ($online ? '#e6f6f0' : '#faedef')};
    animation: ${({ $online }) => ($online ? css`${onlinePulse} 1.8s ease-in-out infinite` : 'none')};
  }
  @media (prefers-reduced-motion: reduce) { &:before { animation: none; } }
`

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #dedede;
`

const SidBadge = styled.span<{ $custom: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 23px;
  padding: 0 8px;
  border-radius: 6px;
  background: ${({ $custom }) => ($custom ? '#f4f4f5' : '#f4f4f5')};
  color: ${({ $custom }) => ($custom ? '#262626' : '#737373')};
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
`

const Price = styled.div`
  color: ${t.color.ink};
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -.25px;
  white-space: nowrap;
  small { margin-left: 3px; color: ${t.color.muted}; font-size: 10px; font-weight: 500; letter-spacing: 0; }
`

export default function RoutePricingList({ routes }: { routes: RouteItem[] }) {
  const { language, t: tr } = useLocale()

  return (
    <>
      <Note><FiInfo aria-hidden="true" />{tr('Rates are charged per SMS. USA and Canada use standard numbers and do not support custom sender IDs.')}</Note>
      <Grid>
        {routes.map((route) => (
          <Card key={route.id}>
            <Top>
              <Flag aria-hidden="true">{route.flag}</Flag>
              <Country>{localizeCountry(route.id, route.country, language)}</Country>
              <Availability $online={route.status === 'Online'}>{tr(route.status)}</Availability>
            </Top>
            <Bottom>
              <SidBadge $custom={route.supportsCustomSid} title={route.supportsCustomSid ? tr('Custom sender ID available') : tr('Standard number; custom sender ID unavailable')}>
                {route.supportsCustomSid ? 'SID' : tr('Standard number')}
              </SidBadge>
              <Price>£{route.priceGbp}<small>/{tr('SMS')}</small></Price>
            </Bottom>
          </Card>
        ))}
      </Grid>
    </>
  )
}
