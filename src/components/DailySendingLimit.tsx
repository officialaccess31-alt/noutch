'use client'

import styled from 'styled-components'
import { licensePlanInfo, type OverviewData } from '@/lib/api'
import { useLocale } from '@/lib/i18n'
import { theme as t } from '@/lib/theme'

const Card = styled.section`
  margin: -10px 0 24px;
  padding: 15px 18px;
  border: 1px solid ${t.color.line};
  border-radius: 10px;
  background: ${t.color.white};
  @media (max-width: ${t.mobile}) { padding: 13px 14px; }
`

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  @media (max-width: 440px) { align-items: flex-start; flex-direction: column; gap: 7px; }
`

const Label = styled.div`
  color: ${t.color.muted};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .15px;
`

const Plan = styled.div`
  margin-top: 3px;
  color: ${t.color.ink};
  font-size: 12px;
  font-weight: 650;
`

const Amount = styled.div`
  color: #404040;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  span { color: ${t.color.muted}; font-size: 10px; font-weight: 500; }
`

const Track = styled.div`
  height: 5px;
  margin-top: 12px;
  overflow: hidden;
  border-radius: 6px;
  background: #f0f0f0;
`

const Fill = styled.div<{ $percent: number; $over: boolean }>`
  width: ${({ $percent }) => `${$percent}%`};
  height: 100%;
  border-radius: inherit;
  background: ${({ $over }) => ($over ? '#737373' : '#333333')};
  transition: width .4s ease;
`

export default function DailySendingLimit({ usage }: { usage: OverviewData['dailyUsage'] }) {
  const { language, t: tr } = useLocale()
  const plan = licensePlanInfo[usage.planId]
  const formattedUsed = new Intl.NumberFormat(language).format(usage.usedToday)
  const unlimited = plan.dailyLimit === null
  const percent = unlimited ? 0 : Math.min(100, Math.max(0, (usage.usedToday / plan.dailyLimit!) * 100))
  const overLimit = !unlimited && usage.usedToday > plan.dailyLimit!

  return (
    <Card aria-label={tr('Daily sending limit')}>
      <Top>
        <div>
          <Label>{tr('Daily sending limit')}</Label>
          <Plan>{tr(plan.name)}</Plan>
        </div>
        <Amount>
          {unlimited
            ? <>{tr('Unlimited daily sends')} <span>· {formattedUsed} {tr('used today')}</span></>
            : <>{formattedUsed} <span>{tr('of')} {new Intl.NumberFormat(language).format(plan.dailyLimit!)} {tr('SMS used today')}</span></>}
        </Amount>
      </Top>
      {!unlimited && <Track aria-label={`${percent.toFixed(0)}% ${tr('of daily limit used')}`}><Fill $percent={percent} $over={overLimit} /></Track>}
    </Card>
  )
}
