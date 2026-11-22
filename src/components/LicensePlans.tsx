'use client'

import Link from 'next/link'
import { useState } from 'react'
import styled from 'styled-components'
import { startLicensePurchase, type LicensePlanId } from '@/lib/api'
import { useToast } from '@/components/toast'
import { ActionButton } from '@/components/ui'
import { theme as t } from '@/lib/theme'
import { FiCheck, FiChevronDown, FiInfo } from 'react-icons/fi'
import { useLocale } from '@/lib/i18n'

type Plan = {
  id: LicensePlanId
  name: string
  price: string
  summary: string
  features: string[]
}

const plans: Plan[] = [
  {
    id: 'regular',
    name: 'Regular',
    price: '£47.25',
    summary: 'A simple plan for individuals and small teams.',
    features: [
      'Up to 5,000 SMS per day',
      'Send at your own pace',
      'Real-time link delivery status',
    ],
  },
  {
    id: 'plus',
    name: 'Pro',
    price: '£129.00',
    summary: 'More daily capacity with two-way and multi-region messaging.',
    features: [
      'Two-way SMS communication',
      'Up to 15,000 SMS per day',
      'High-speed servers and optimized routing',
      'Multi-region sending',
      'Real-time link delivery status',
    ],
  },
  {
    id: 'inner-circle',
    name: 'Advanced',
    price: '£248.99',
    summary: 'Unlimited messaging with dedicated infrastructure and API access.',
    features: [
      'Two-way SMS communication',
      'Unlimited SMS per day',
      'Private IP address and dedicated server',
      'Up to 1,000 SMS in 5 minutes',
      'API access',
      'Multi-region sending',
      'Real-time link delivery status',
      'Discounted SMS rates',
      'MMS file attachments',
    ],
  },
  {
    id: 'enterprise',
    name: 'Elite',
    price: '£499.99',
    summary: 'Unlimited messaging with advanced routing, sender ID, and privacy controls.',
    features: [
      'Two-way SMS communication',
      'Unlimited SMS per day',
      'Private IP address and dedicated server',
      'Custom sender ID: number, shortcode, or alphanumeric',
      'API access',
      'Multi-region sending',
      'Private country routes',
      'Discounted SMS and routing rates',
      'High-volume message processing',
      'Custom server configuration',
      'MMS file attachments',
      'End-to-end encryption',
    ],
  },
]

const Wrap = styled.div`
  display: grid;
  gap: 16px;
  container-type: inline-size;
`

const Info = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px 14px;
  border: 1px solid ${t.color.line};
  border-radius: 10px;
  background: #ffffff;
  color: #525252;
  font-size: 12px;
  line-height: 1.55;
  svg { width: 17px; height: 17px; flex: none; margin-top: 1px; color: #111111; }
  a { color: #262626; font-weight: 650; text-decoration: underline; text-underline-offset: 2px; }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 12px;
  @container (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @container (max-width: 600px) { grid-template-columns: 1fr; gap: 10px; }
`

const Card = styled.article`
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 17px;
  border: 1px solid ${t.color.line};
  border-radius: 12px;
  background: ${t.color.white};
  box-shadow: 0 4px 18px rgba(0, 0, 0, .035);
  @media (max-width: ${t.mobile}) { padding: 14px 16px; }
`

const PlanHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 8px;
`

const PlanName = styled.h2`
  margin: 0;
  color: ${t.color.ink};
  font: 600 17px ${t.font.display};
  letter-spacing: -.25px;
  @container (max-width: 600px) { display: none; }
`

const PlanToggle = styled.button`
  display: none;
  width: 100%;
  padding: 0;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  color: ${t.color.ink};
  text-align: left;
  cursor: pointer;
  font: 600 17px ${t.font.display};
  svg { width: 16px; height: 16px; color: ${t.color.muted}; transition: transform .18s ease; }
  &[aria-expanded='true'] svg { transform: rotate(180deg); }
  &:focus-visible { outline: 2px solid #737373; outline-offset: 3px; border-radius: 4px; }
  @container (max-width: 600px) { display: flex; }
`

const Summary = styled.p`
  min-height: 38px;
  margin: 0 0 12px;
  color: ${t.color.muted};
  font-size: 11px;
  line-height: 1.5;
`

const Price = styled.div`
  margin-bottom: 12px;
  color: ${t.color.ink};
  strong { font: 600 24px ${t.font.display}; letter-spacing: -.6px; }
  span { margin-left: 4px; color: ${t.color.muted}; font-size: 11px; }
`

const FeatureList = styled.ul<{ $expanded: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 9px;
  padding: 13px 0 16px;
  margin: 0 0 auto;
  list-style: none;
  border-top: 1px solid ${t.color.line};
  li { display: flex; align-items: flex-start; gap: 7px; color: #525252; font-size: 11px; line-height: 1.45; }
  svg { width: 14px; height: 14px; flex: none; margin-top: 1px; color: ${t.color.ink}; stroke-width: 2.2; }
  @container (max-width: 600px) { display: ${({ $expanded }) => ($expanded ? 'grid' : 'none')}; }
`

const PlanButton = styled(ActionButton)`
  width: 100%;
  margin-top: 2px;
  &:disabled { opacity: .65; cursor: wait; }
`

export default function LicensePlans() {
  const toast = useToast()
  const { t: tr } = useLocale()
  const [pendingPlan, setPendingPlan] = useState<LicensePlanId | null>(null)
  const [openPlan, setOpenPlan] = useState<LicensePlanId | null>(null)

  async function purchase(plan: Plan) {
    setPendingPlan(plan.id)
    try {
      const { checkoutUrl } = await startLicensePurchase(plan.id)
      if (!checkoutUrl) throw new Error(tr('The checkout link is unavailable.'))
      const target = new URL(checkoutUrl, window.location.origin)
      if (!['http:', 'https:'].includes(target.protocol)) throw new Error(tr('The checkout link is invalid.'))
      window.location.assign(target.href)
    } catch (error) {
      toast.error(tr('Could not start purchase'), error instanceof Error ? tr(error.message) : tr('Please try again.'))
    } finally {
      setPendingPlan(null)
    }
  }

  return (
    <Wrap>
      <Info>
        <FiInfo aria-hidden="true" />
        <span>{tr('Your license opens up the gateway features and higher sending limits. SMS still uses credits;')} <Link href="/route-pricing">{tr('check country rates')}</Link> {tr('before sending.') } {tr('Free accounts can send up to 10 messages a day.')}</span>
      </Info>

      <Grid>
        {plans.map((plan) => (
          <Card key={plan.id}>
            <PlanHead>
              <PlanName>{tr(plan.name)}</PlanName>
              <PlanToggle
                type="button"
                aria-expanded={openPlan === plan.id}
                aria-controls={`${plan.id}-features`}
                onClick={() => setOpenPlan((current) => current === plan.id ? null : plan.id)}
              >
                {tr(plan.name)}<FiChevronDown aria-hidden="true" />
              </PlanToggle>
            </PlanHead>
            <Summary>{tr(plan.summary)}</Summary>
            <Price><strong>{plan.price}</strong><span>{tr('per year')}</span></Price>
            <FeatureList id={`${plan.id}-features`} $expanded={openPlan === plan.id}>
              {plan.features.map((feature) => <li key={feature}><FiCheck aria-hidden="true" />{tr(feature)}</li>)}
            </FeatureList>
            <PlanButton type="button" disabled={pendingPlan !== null} onClick={() => purchase(plan)}>
              {pendingPlan === plan.id ? tr('Opening checkout…') : tr('Obtain')}
            </PlanButton>
          </Card>
        ))}
      </Grid>
    </Wrap>
  )
}
