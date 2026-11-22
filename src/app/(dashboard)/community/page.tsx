'use client'

import { FiArrowUpRight, FiMessageCircle, FiSend } from 'react-icons/fi'
import styled from 'styled-components'
import { Content } from '@/components/ui'
import { theme as t } from '@/lib/theme'
import { useLocale } from '@/lib/i18n'

const Wrap = styled.div`
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
`

const Intro = styled.header`
  max-width: 620px;
  margin: 0 auto 34px;
  text-align: center;
  .eyebrow { margin-bottom: 9px; color: #525252; font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
  h1 { margin: 0 0 9px; color: ${t.color.ink}; font: 600 32px ${t.font.display}; letter-spacing: -1px; }
  p { margin: 0; color: ${t.color.muted}; font-size: 13px; line-height: 1.65; }
  @media (max-width: ${t.mobile}) { margin-bottom: 24px; h1 { font-size: 27px; } }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
  @media (max-width: ${t.mobile}) { grid-template-columns: 1fr; gap: 12px; }
`

const Card = styled.section<{ $accent?: boolean }>`
  min-width: 0;
  min-height: 258px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid ${t.color.line};
  border-radius: 15px;
  background: ${t.color.white};
  box-shadow: ${({ $accent }) => ($accent ? '0 8px 24px rgba(0, 0, 0, .055)' : '0 4px 14px rgba(0, 0, 0, .025)')};
  .channel-label { color: #525252; font-size: 10px; font-weight: 650; }
  @media (max-width: ${t.mobile}) { min-height: 230px; padding: 19px; }
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 21px;
`

const IconTile = styled.div<{ $accent?: boolean }>`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: ${({ $accent }) => ($accent ? '#f4f4f5' : '#f4f4f5')};
  color: ${({ $accent }) => ($accent ? '#111111' : '#737373')};
  svg { width: 20px; height: 20px; stroke-width: 1.8; }
`

const CardTitle = styled.h2`
  margin: 0 0 8px;
  color: ${t.color.ink};
  font: 600 17px ${t.font.display};
`

const Description = styled.p`
  max-width: 390px;
  margin: 0 0 22px;
  color: ${t.color.muted};
  font-size: 12px;
  line-height: 1.6;
`

const Maintenance = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 29px;
  padding: 0 10px;
  border: 1px solid #f0dfb7;
  border-radius: 20px;
  background: #fffaf0;
  color: #805d21;
  font-size: 10px;
  font-weight: 650;
  &:before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #d7a143; }
`

const ActionLink = styled.a`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-start;
  margin-top: auto;
  padding: 0 16px;
  border: 1px solid #111111;
  border-radius: 9px;
  background: #111111;
  color: ${t.color.white};
  font: 600 12px ${t.font.body};
  text-decoration: none;
  transition: background .18s ease, border-color .18s ease;
  &:hover { background: #262626; border-color: #262626; }
  &:focus-visible { outline: 2px solid #737373; outline-offset: 2px; }
  svg { width: 15px; height: 15px; }
`

const DisabledAction = styled.button`
  min-height: 42px;
  align-self: flex-start;
  margin-top: auto;
  padding: 0 14px;
  border: 1px solid #dedede;
  border-radius: 8px;
  background: #f7f7f7;
  color: #a3a3a3;
  font: 600 12px ${t.font.body};
  cursor: not-allowed;
`

function telegramSupportUrl() {
  const configured = process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL
  if (!configured) return 'https://t.me/replace_with_support_username'
  try {
    const url = new URL(configured)
    return url.protocol === 'https:' && (url.hostname === 't.me' || url.hostname === 'telegram.me')
      ? url.toString()
      : 'https://t.me/replace_with_support_username'
  } catch {
    return 'https://t.me/replace_with_support_username'
  }
}

export default function SupportPage() {
  const { t: tr } = useLocale()
  return (
    <Content>
      <Wrap>
        <Intro>
          <div className="eyebrow">{tr('Support center')}</div>
          <h1>{tr('Support')}</h1>
          <p>{tr("Choose a support channel and we’ll help you get back on track.")}</p>
        </Intro>
        <Grid>
          <Card>
            <CardTop>
              <IconTile><FiMessageCircle aria-hidden="true" /></IconTile>
              <Maintenance>{tr('Under maintenance')}</Maintenance>
            </CardTop>
            <CardTitle>{tr('Live chat')}</CardTitle>
            <Description>{tr('Chat with our support team directly from your account.')}</Description>
            <DisabledAction type="button" disabled>{tr('Chat unavailable')}</DisabledAction>
          </Card>
          <Card $accent>
            <CardTop>
              <IconTile $accent><FiSend aria-hidden="true" /></IconTile>
              <span className="channel-label">{tr('Available channel')}</span>
            </CardTop>
            <CardTitle>{tr('Telegram')}</CardTitle>
            <Description>{tr('Contact support through our Telegram channel.')}</Description>
            <ActionLink href={telegramSupportUrl()} target="_blank" rel="noopener noreferrer">
              {tr('Open Telegram')} <FiArrowUpRight aria-hidden="true" />
            </ActionLink>
          </Card>
        </Grid>
      </Wrap>
    </Content>
  )
}
