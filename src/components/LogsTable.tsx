'use client'

import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import type { LogItem } from '@/lib/api'
import { Chip, EmptyRow, Table, Truncate } from '@/components/ui'
import { FiFileText } from 'react-icons/fi'

const LogRow = styled.tr`
  cursor: pointer;
  &:focus-visible { outline: 2px solid #737373; outline-offset: -2px; }
`

const RecipientSummary = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #525252;
  white-space: nowrap;
`

const Count = styled.span`
  padding: 3px 7px;
  border-radius: 20px;
  background: #f4f4f5;
  color: #111111;
  font-size: 10px;
  font-weight: 600;
`

const Instruction = styled.p`
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  padding: 14px 22px;
  border-bottom: 1px solid #dedede;
  background: #fafafa;
  color: #525252;
  font-size: 12px;
  line-height: 1.5;
  svg { width: 17px; height: 17px; flex: none; fill: none; stroke: #525252; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  @media (max-width: 700px) { padding: 12px 14px; }
`

export default function LogsTable({ items }: { items: LogItem[] }) {
  const router = useRouter()

  return (
    <>
      <Instruction>
        <FiFileText aria-hidden="true" />
        Click a message to inspect its details.
      </Instruction>
      <Table headers={['Date', 'Recipient(s)', 'Sender ID', 'Message', 'Status', 'Deducted']}>
        {items.length === 0 ? (
          <tr><EmptyRow colSpan={6}>No messages found.</EmptyRow></tr>
        ) : items.map((log) => {
        const recipients = log.recipients?.length ? log.recipients : [log.recipient]
        const summary = recipients.length > 1 ? `${recipients[0]} +${recipients.length - 1} more` : recipients[0]
        const href = `/logs/${encodeURIComponent(log.id)}`
        return (
          <LogRow
            key={log.id}
            tabIndex={0}
            role="link"
            aria-label={`View message details for ${recipients.length} recipient${recipients.length === 1 ? '' : 's'}`}
            onClick={() => router.push(href)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                router.push(href)
              }
            }}
          >
            <td>{log.date}</td>
            <td><RecipientSummary title={recipients.join(', ')}>{summary}{recipients.length > 1 && <Count>{recipients.length} total</Count>}</RecipientSummary></td>
            <td>{log.sid}</td>
            <td><Truncate translate="no" title={log.message}>{log.message}</Truncate></td>
            <td><Chip $tone={log.tone}>{log.status}</Chip></td>
            <td>{log.amountDeducted || '—'}</td>
          </LogRow>
        )
        })}
      </Table>
    </>
  )
}
