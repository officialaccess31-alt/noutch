'use client'

import { useState, type FormEvent } from 'react'
import { deleteSid, requestSid, type SidItem, type SidRegion } from '@/lib/api'
import { useApiAction } from '@/hooks/useApiAction'
import { useToast } from '@/components/toast'
import { ActionButton, Chip, Panel, PanelBody } from '@/components/ui'
import { theme as t } from '@/lib/theme'
import styled from 'styled-components'
import { FiInfo, FiTrash2 } from 'react-icons/fi'

const Stack = styled.div`
  display: grid;
  gap: 18px;
`

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: ${t.mobile}) {
    grid-template-columns: 1fr;
  }
`

const OptionCard = styled.button<{ $selected: boolean }>`
  min-height: 88px;
  padding: 14px;
  border: 1px solid ${({ $selected }) => ($selected ? '#737373' : t.color.line)};
  border-radius: ${t.radius.md};
  background: ${({ $selected }) => ($selected ? '#fafafa' : t.color.white)};
  color: ${t.color.ink};
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
  &:hover {
    border-color: #d4d4d4;
    background: #fafafa;
  }
  &:focus-visible {
    outline: 2px solid #737373;
    outline-offset: 2px;
  }
  strong {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 650;
  }
  span {
    display: block;
    color: ${t.color.muted};
    font-size: 11px;
    line-height: 1.5;
  }
`

const SidList = styled.div`
  display: grid;
  gap: 10px;
  padding: 16px 20px;
  @media (max-width: ${t.mobile}) {
    padding: 12px;
  }
`

const SidCard = styled.article`
  padding: 14px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.md};
  background: ${t.color.white};
`

const SidTop = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  @media (max-width: ${t.mobile}) {
    grid-template-columns: minmax(0, 1fr) auto;
  }
`

const SidIdentity = styled.div`
  min-width: 0;
`

const SidName = styled.div`
  overflow-wrap: anywhere;
  color: ${t.color.ink};
  font-size: 13px;
  font-weight: 650;
`

const SidRegion = styled.div`
  margin-top: 4px;
  color: ${t.color.muted};
  font-size: 11px;
`

const SidActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: ${t.mobile}) {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
`

const SmallButton = styled.button<{ $danger?: boolean }>`
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid ${({ $danger }) => ($danger ? '#f1caca' : t.color.line)};
  border-radius: 7px;
  background: ${t.color.white};
  color: ${({ $danger }) => ($danger ? '#a83232' : '#525252')};
  font: 600 11px ${t.font.body};
  cursor: pointer;
  &:hover:not(:disabled) {
    background: ${({ $danger }) => ($danger ? '#fff5f5' : '#f7f7f7')};
  }
  &:focus-visible {
    outline: 2px solid #737373;
    outline-offset: 1px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`

const IconButton = styled.button<{ $danger?: boolean }>`
  width: 36px;
  height: 36px;
  display: inline-grid;
  place-items: center;
  border: 1px solid ${({ $danger }) => ($danger ? '#f1caca' : t.color.line)};
  border-radius: 8px;
  background: ${t.color.white};
  color: ${({ $danger }) => ($danger ? '#a83232' : '#525252')};
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  &:hover:not(:disabled) {
    background: ${({ $danger }) => ($danger ? '#fff5f5' : '#f7f7f7')};
    border-color: ${({ $danger }) => ($danger ? '#e8b6b6' : '#d4d4d4')};
  }
  &:focus-visible {
    outline: 2px solid #737373;
    outline-offset: 2px;
  }
  &:disabled { opacity: 0.6; cursor: wait; }
  svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
`

const Details = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px 32px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid ${t.color.line};
  div {
    color: #404040;
    font-size: 12px;
  }
  span {
    display: block;
    margin-bottom: 4px;
    color: ${t.color.muted};
    font-size: 10px;
  }
`

const DeletePrompt = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #fff7f7;
  color: #793333;
  font-size: 12px;
`

const Empty = styled.div`
  padding: 24px 16px;
  color: ${t.color.muted};
  text-align: center;
  font-size: 12px;
`

const ViewMore = styled.button`
  min-height: 38px;
  border: 0;
  background: transparent;
  color: #262626;
  font: 600 12px ${t.font.body};
  cursor: pointer;
  &:hover { text-decoration: underline; }
`

const NameBlock = styled.div`
  display: grid;
  gap: 7px;
  margin: 18px 0 16px;
  label {
    color: #404040;
    font-size: 12px;
    font-weight: 600;
  }
`

const TextInput = styled.input<{ $invalid: boolean }>`
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid ${({ $invalid }) => ($invalid ? '#e5484d' : t.color.line)};
  border-radius: ${t.radius.sm};
  background: ${t.color.white};
  color: ${t.color.ink};
  font: 13px ${t.font.body};
  &:focus {
    outline: 2px solid #737373;
    outline-offset: 1px;
    border-color: ${t.color.primary};
  }
  &::placeholder {
    color: #a3a3a3;
  }
`

const FieldError = styled.p`
  margin: 0;
  color: #9b2c2c;
  font-size: 11px;
`

const Helper = styled.p`
  margin: 16px 0 0;
  color: ${t.color.muted};
  font-size: 11px;
  line-height: 1.55;
`

type Choice = { value: SidRegion; title: string; description: string }
const choices: Choice[] = [
  { value: 'usa', title: 'USA', description: 'Standard US number.' },
  { value: 'canada', title: 'Canada', description: 'Standard Canadian number.' },
  { value: 'eu_uk_custom', title: 'EU / UK', description: 'Choose a custom sender name.' },
]

function statusFor(item: SidItem): { label: string; tone: 'ok' | 'warn' | 'muted' } {
  const status = item.status.toLowerCase()
  if (status.includes('reject')) return { label: 'Rejected', tone: 'warn' }
  if (status === 'active' || status === 'approved') return { label: 'Active', tone: 'ok' }
  return { label: 'Activating', tone: 'warn' }
}

function regionFor(item: SidItem) {
  if (item.region) return item.region
  return '—'
}

export default function SidManager({ initialSids }: { initialSids: SidItem[] }) {
  const toast = useToast()
  const { run, pending, fieldErrors } = useApiAction()
  const [sids, setSids] = useState(initialSids)
  const [region, setRegion] = useState<SidRegion>('usa')
  const [senderName, setSenderName] = useState('')
  const [localError, setLocalError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const senderNameError = localError || fieldErrors.senderName || fieldErrors.sender_name || fieldErrors.name

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = senderName.trim()
    if (region === 'eu_uk_custom' && !cleanName) {
      setLocalError('Enter the sender name you want to request.')
      return
    }
    setLocalError('')

    const result = await run(
      () => requestSid({ region, ...(region === 'eu_uk_custom' ? { senderName: cleanName } : {}) }),
      'SID request failed'
    )
    if (!result) return

    setSids((current) => [result.sid, ...current.filter((item) => item.id !== result.sid.id)])
    setSenderName('')
    toast.success('SID request received', result.message ?? 'We’ll update the status here as it is processed.')
  }

  async function onDelete(item: SidItem) {
    const deleted = await run(async () => {
      await deleteSid(item.id)
      return true
    }, 'SID could not be deleted')
    if (!deleted) return
    setSids((current) => current.filter((sid) => sid.id !== item.id))
    setDeleteId(null)
    toast.success('SID deleted', `${item.name} was removed from your sender IDs.`)
  }

  const visibleSids = expanded ? sids : sids.slice(0, 3)

  return (
    <Stack>
      <Panel title="Choose a region" subtitle="Select the type of sender ID you need.">
        <PanelBody>
          <form onSubmit={onSubmit}>
            <div role="radiogroup" aria-label="Sender ID type">
              <Options>
                {choices.map((choice) => (
                  <OptionCard
                    key={choice.value}
                    type="button"
                    role="radio"
                    tabIndex={region === choice.value ? 0 : -1}
                    aria-checked={region === choice.value}
                    $selected={region === choice.value}
                    onKeyDown={(event) => {
                      if (!['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
                      event.preventDefault()
                      const group = event.currentTarget.closest('[role="radiogroup"]')
                      const radios = group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
                      if (!radios?.length) return
                      const currentIndex = choices.findIndex((item) => item.value === choice.value)
                      const nextIndex = event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? choices.length - 1
                          : (currentIndex + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + choices.length) % choices.length
                      radios[nextIndex].focus()
                      radios[nextIndex].click()
                    }}
                    onClick={() => {
                      setRegion(choice.value)
                      setLocalError('')
                    }}
                  >
                    <strong>{choice.title}</strong>
                    <span>{choice.description}</span>
                  </OptionCard>
                ))}
              </Options>
            </div>

            {region === 'eu_uk_custom' && (
              <NameBlock>
                <label htmlFor="sid-custom-name">Custom sender name</label>
                <TextInput
                  id="sid-custom-name"
                  value={senderName}
                  onChange={(event) => {
                    setSenderName(event.target.value)
                    setLocalError('')
                  }}
                  placeholder="Enter the name recipients should see"
                  $invalid={!!senderNameError}
                  aria-invalid={!!senderNameError}
                  aria-describedby={senderNameError ? 'sid-custom-name-error' : undefined}
                />
                {senderNameError && <FieldError id="sid-custom-name-error">{senderNameError}</FieldError>}
              </NameBlock>
            )}

            <Helper>
              USA and Canada requests are for standard local numbers. EU / UK requests let you choose the sender name recipients will see.
            </Helper>
            <ActionButton type="submit" disabled={pending} style={{ marginTop: 16 }}>
              {pending ? 'Submitting…' : region === 'eu_uk_custom' ? 'Request custom SID' : 'Get SID'}
            </ActionButton>
          </form>
        </PanelBody>
      </Panel>

      <Panel title="Your sender IDs" subtitle={`${sids.length} sender ID${sids.length === 1 ? '' : 's'}`}>
        <SidList>
          {sids.length === 0 ? (
            <Empty>No sender IDs yet. Choose a region above to get started.</Empty>
          ) : (
            visibleSids.map((item) => {
              const status = statusFor(item)
              const isExpanded = expandedIds.includes(item.id)
              return (
                <SidCard key={item.id}>
                  <SidTop>
                    <SidIdentity>
                      <SidName>{item.name}</SidName>
                      <SidRegion>{regionFor(item)}</SidRegion>
                    </SidIdentity>
                    <Chip $tone={status.tone}>{status.label}</Chip>
                    <SidActions>
                      <IconButton
                        type="button"
                        title={isExpanded ? 'Hide details' : 'Show details'}
                        aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${item.name}`}
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedIds((current) => isExpanded ? current.filter((id) => id !== item.id) : [...current, item.id])}
                      >
                        <FiInfo aria-hidden="true" />
                      </IconButton>
                      <IconButton type="button" $danger title="Delete sender ID" aria-label={`Delete ${item.name}`} onClick={() => setDeleteId(item.id)}>
                        <FiTrash2 aria-hidden="true" />
                      </IconButton>
                    </SidActions>
                  </SidTop>
                  {isExpanded && (
                    <Details>
                      <div><span>Region</span>{regionFor(item)}</div>
                      <div><span>Status</span>{status.label}</div>
                      <div><span>Requested</span>{item.created}</div>
                    </Details>
                  )}
                  {deleteId === item.id && (
                    <DeletePrompt role="group" aria-label={`Confirm deleting ${item.name}`}>
                      <span>Delete this sender ID?</span>
                      <div>
                        <SmallButton type="button" disabled={pending} onClick={() => setDeleteId(null)}>Cancel</SmallButton>{' '}
                        <SmallButton type="button" $danger disabled={pending} onClick={() => onDelete(item)}>
                          {pending ? 'Deleting…' : 'Confirm delete'}
                        </SmallButton>
                      </div>
                    </DeletePrompt>
                  )}
                </SidCard>
              )
            })
          )}
          {sids.length > 3 && (
            <ViewMore type="button" onClick={() => setExpanded((current) => !current)}>
              {expanded ? 'Show less' : `View all ${sids.length} sender IDs`}
            </ViewMore>
          )}
        </SidList>
      </Panel>
    </Stack>
  )
}
