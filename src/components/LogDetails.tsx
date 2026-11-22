'use client'

import styled from 'styled-components'
import type { LogItem } from '@/lib/api'
import { Chip, Panel, PanelBody } from '@/components/ui'
import { theme as t } from '@/lib/theme'
import { FiMessageCircle } from 'react-icons/fi'

const Stack = styled.div`
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
`

const DetailBody = styled(PanelBody)`
  @media (max-width: ${t.mobile}) { padding: 17px; }
  @media (max-width: 420px) { padding: 14px; }
`

const Grid = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 24px;
  margin: 0;
  @media (max-width: ${t.mobile}) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 420px) { grid-template-columns: 1fr; gap: 14px; }
`

const SummaryTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${t.color.line};
`

const Charge = styled.div`
  text-align: right;
  span { display: block; margin-bottom: 4px; color: ${t.color.muted}; font-size: 10px; }
  strong { color: #111111; font: 600 20px ${t.font.display}; letter-spacing: -.3px; }
`

const Field = styled.div`
  min-width: 0;
  dt { margin-bottom: 5px; color: ${t.color.muted}; font-size: 11px; }
  dd { margin: 0; color: #404040; font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
`

const Numbers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
`

const NumberTag = styled.span`
  padding: 6px 9px;
  border: 1px solid ${t.color.line};
  border-radius: 7px;
  background: ${t.color.white};
  color: #525252;
  font: 12px ${t.font.body};
`

const Message = styled.div`
  padding: 13px 14px;
  border: 1px solid ${t.color.line};
  border-radius: 9px;
  background: #fafafa;
  color: #404040;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`

const Reply = styled.div`
  padding: 14px;
  border: 1px solid ${t.color.line};
  border-radius: 9px;
  background: #fafafa;
  p { margin: 7px 0 0; color: #404040; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
  small { color: ${t.color.muted}; font-size: 11px; }
`

const EmptyReply = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border: 1px dashed ${t.color.line};
  border-radius: 9px;
  color: ${t.color.muted};
  font-size: 12px;
  svg { width: 18px; height: 18px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
`

export default function LogDetails({ log }: { log: LogItem }) {
  const recipients = log.recipients?.length ? log.recipients : [log.recipient]

  return (
    <Stack>
      <Panel title="Delivery">
        <DetailBody>
          <SummaryTop>
            <Chip $tone={log.tone}>{log.status}</Chip>
            <Charge><span>Amount deducted</span><strong>{log.amountDeducted || 'Not available'}</strong></Charge>
          </SummaryTop>
          <Grid>
            <Field><dt>Sent</dt><dd>{log.date}</dd></Field>
            <Field><dt>Delivered at</dt><dd>{log.deliveryTime || 'Not available'}</dd></Field>
            <Field><dt>Sender ID</dt><dd>{log.sid}</dd></Field>
            <Field><dt>Recipients</dt><dd>{recipients.length} number{recipients.length === 1 ? '' : 's'}</dd></Field>
          </Grid>
          <Numbers>{recipients.map((number, index) => <NumberTag key={`${number}-${index}`}>{number}</NumberTag>)}</Numbers>
        </DetailBody>
      </Panel>

      <Panel title="Message sent">
        <DetailBody><Message translate="no">{log.message}</Message></DetailBody>
      </Panel>

      <Panel title="Reply">
        <DetailBody>
          <Reply>
            {log.reply?.trim() ? <>
              <small>{log.replyAt ? `Received ${log.replyAt}` : 'Received reply'}</small>
              <p translate="no">{log.reply}</p>
            </> : <EmptyReply>
              <FiMessageCircle aria-hidden="true" />
              No reply has been recorded for this message.
            </EmptyReply>}
          </Reply>
        </DetailBody>
      </Panel>
    </Stack>
  )
}
