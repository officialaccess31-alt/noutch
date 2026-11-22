'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { createCryptoInvoice, type CryptoInvoice } from '@/lib/api'
import { useApiAction } from '@/hooks/useApiAction'
import { useToast } from '@/components/toast'
import { ActionButton, Panel, PanelBody, Select } from '@/components/ui'
import { theme as t } from '@/lib/theme'
import {
  FiAlertTriangle, FiBriefcase, FiClock, FiCreditCard, FiCopy,
  FiDollarSign, FiFileText, FiGlobe,
} from 'react-icons/fi'

type Step = 'amount' | 'method' | 'coin' | 'invoice'
type SavedFlow = { step: Step; amountText: string; coin: string; otherCoin: string; invoice: CryptoInvoice | null }

const coins = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'LTC', 'XRP', 'DOGE', 'TRX', 'ADA', 'TON']
const STORAGE_KEY = 'northstar.credit-deposit.v1'

const Wrap = styled.div`
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
`

const Intro = styled.header`
  margin: 0 auto 22px;
  text-align: center;
  h1 { margin: 0 0 6px; color: ${t.color.ink}; font: 600 26px ${t.font.display}; letter-spacing: -.7px; }
  p { margin: 0; color: ${t.color.muted}; font-size: 13px; line-height: 1.5; }
  @media (max-width: ${t.mobile}) { margin-bottom: 18px; h1 { font-size: 23px; } }
`

const Steps = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 18px;
  color: ${t.color.muted};
  font-size: 11px;
  @media (max-width: ${t.mobile}) { justify-content: space-between; gap: 4px; }
`

const StepItem = styled.span<{ $active: boolean; $done: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: ${({ $active, $done }) => ($active ? '#171717' : $done ? '#247a62' : t.color.muted)};
  font-weight: ${({ $active }) => ($active ? 650 : 500)};
  white-space: nowrap;
  i {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid ${({ $active, $done }) => ($active ? '#737373' : $done ? '#a8d8c9' : t.color.line)};
    background: ${({ $active, $done }) => ($active ? '#f4f4f5' : $done ? '#edf8f4' : t.color.white)};
    color: ${({ $active, $done }) => ($active ? '#111111' : $done ? '#247a62' : '#737373')};
    box-shadow: ${({ $active }) => ($active ? '0 0 0 3px #11111110' : 'none')};
    font-style: normal;
    svg { width: 13px; height: 13px; stroke-width: 1.9; }
  }
  @media (max-width: 430px) { font-size: 0; gap: 0; }
`

const StepLine = styled.span<{ $done: boolean }>`
  flex: 1;
  height: 1px;
  min-width: 10px;
  background: ${({ $done }) => ($done ? '#9fd2c1' : t.color.line)};
`

const Recommendation = styled.div`
  display: flex;
  gap: 11px;
  padding: 14px 15px;
  margin-bottom: 22px;
  border: 1px solid #f0dfb7;
  border-radius: 9px;
  background: #fffaf0;
  color: #72521c;
  font-size: 12px;
  line-height: 1.55;
  svg { width: 18px; height: 18px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  strong { display: block; margin-bottom: 3px; color: #584014; font-size: 12px; }
`

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #404040;
  font-size: 12px;
  font-weight: 600;
`

const CurrencyLabel = styled.label`
  margin: 0 0 8px;
  color: #404040;
  font-size: 12px;
  font-weight: 600;
`

const AmountWrap = styled.div`
  display: flex;
  align-items: center;
  min-height: 52px;
  border: 1px solid ${t.color.line};
  border-radius: 9px;
  background: ${t.color.white};
  &:focus-within { border-color: ${t.color.primary}; box-shadow: 0 0 0 3px #1111111c; }
  span {
    width: 48px;
    height: 50px;
    flex: none;
    display: grid;
    place-items: center;
    border-right: 1px solid ${t.color.line};
    color: ${t.color.muted};
    font-size: 16px;
    font-weight: 600;
  }
  input {
    width: 100%;
    min-width: 0;
    height: 50px;
    padding: 0 14px;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${t.color.ink};
    font: 600 18px ${t.font.body};
  }
`

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
`

const BackButton = styled.button`
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #525252;
  font: 600 12px ${t.font.body};
  cursor: pointer;
  &:hover { background: #f4f4f5; color: ${t.color.ink}; }
  &:focus-visible { outline: 2px solid #737373; outline-offset: 2px; }
`

const Methods = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: ${t.mobile}) { grid-template-columns: 1fr; }
`

const Method = styled.button<{ $selected?: boolean }>`
  min-height: 112px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid ${({ $selected }) => ($selected ? '#737373' : t.color.line)};
  border-radius: 10px;
  background: ${({ $selected }) => ($selected ? '#fafafa' : t.color.white)};
  color: ${t.color.ink};
  text-align: left;
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease;
  &:hover { border-color: #d4d4d4; background: #fafafa; }
  &:focus-visible { outline: 2px solid #737373; outline-offset: 2px; }
  strong { font-size: 14px; }
  small { color: ${t.color.muted}; font-size: 11px; }
  svg { width: 21px; height: 21px; fill: none; stroke: #111111; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  @media (max-width: ${t.mobile}) { min-height: 76px; display: grid; grid-template-columns: 28px 1fr; gap: 2px 10px; strong, small { grid-column: 2; } svg { grid-row: 1 / 3; } }
`

const Notice = styled.div<{ $error?: boolean }>`
  margin-top: 15px;
  padding: 12px 14px;
  border: 1px solid ${({ $error }) => ($error ? '#f1caca' : '#dedede')};
  border-radius: 8px;
  background: ${({ $error }) => ($error ? '#fff7f7' : '#fafafa')};
  color: ${({ $error }) => ($error ? '#8b3838' : '#525252')};
  font-size: 12px;
  line-height: 1.5;
`

const CoinRow = styled.div`
  display: grid;
  gap: 8px;
  max-width: 420px;
`

const CoinInput = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid ${t.color.line};
  border-radius: 8px;
  background: ${t.color.white};
  color: ${t.color.ink};
  font: 13px ${t.font.body};
  &:focus { outline: 2px solid #737373; outline-offset: 1px; border-color: ${t.color.primary}; }
  &::placeholder { color: #a3a3a3; }
`

const AmountSummary = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  padding: 13px 14px;
  border: 1px solid ${t.color.line};
  border-radius: 8px;
  background: #fafafa;
  color: ${t.color.muted};
  font-size: 12px;
  strong { color: ${t.color.ink}; font-size: 13px; }
`

const InvoiceStack = styled.div`
  display: grid;
  gap: 17px;
  padding: 18px;
  border: 1px solid ${t.color.line};
  border-radius: 12px;
  background: ${t.color.white};
  @media (max-width: ${t.mobile}) { padding: 14px; }
`

const InvoiceTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  @media (max-width: 420px) { flex-direction: column; }
`

const InvoiceAmount = styled.div`
  strong { display: block; margin-top: 5px; color: ${t.color.ink}; font: 600 25px ${t.font.display}; overflow-wrap: anywhere; }
  span { color: ${t.color.muted}; font-size: 11px; }
`

const Timer = styled.div<{ $expired: boolean }>`
  padding: 9px 11px;
  border: 1px solid ${({ $expired }) => ($expired ? '#f1caca' : '#f0dfb7')};
  border-radius: 8px;
  background: ${({ $expired }) => ($expired ? '#fff7f7' : '#fffaf0')};
  color: ${({ $expired }) => ($expired ? '#8b3838' : '#72521c')};
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
`

const PreviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 20px;
  background: #f4f4f5;
  color: #111111;
  font-size: 10px;
  font-weight: 700;
`

const ExpiredState = styled.div`
  display: grid;
  justify-items: center;
  gap: 11px;
  padding: 23px 18px;
  border: 1px solid #f1d4d4;
  border-radius: 10px;
  background: #fffafa;
  text-align: center;
  svg { width: 30px; height: 30px; fill: none; stroke: #bb4d4d; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  strong { color: #843b3b; font-size: 15px; }
  p { max-width: 470px; margin: 0; color: #765353; font-size: 12px; line-height: 1.6; }
`

const AddressBlock = styled.div`
  display: grid;
  gap: 8px;
  label { color: ${t.color.muted}; font-size: 11px; font-weight: 600; }
`

const Address = styled.code`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid ${t.color.line};
  border-radius: 8px;
  background: #fafafa;
  color: #404040;
  font: 12px/1.5 ${t.font.body};
  overflow-wrap: anywhere;
  word-break: break-word;
`

const CopyButton = styled.button`
  min-height: 44px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  border: 1px solid ${t.color.line};
  border-radius: 8px;
  background: ${t.color.white};
  color: #111111;
  font: 600 12px ${t.font.body};
  cursor: pointer;
  &:hover { background: #fafafa; border-color: #d4d4d4; }
  &:focus-visible { outline: 2px solid #737373; outline-offset: 2px; }
  &:disabled { opacity: .55; cursor: not-allowed; }
  svg { width: 16px; height: 16px; }
`

function formatRemaining(milliseconds: number) {
  const total = Math.max(0, Math.floor(milliseconds / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function CreditsDeposit() {
  const toast = useToast()
  const { run, pending } = useApiAction()
  const [step, setStep] = useState<Step>('amount')
  const [amountText, setAmountText] = useState('')
  const [coin, setCoin] = useState('BTC')
  const [otherCoin, setOtherCoin] = useState('')
  const [notice, setNotice] = useState('')
  const [invoice, setInvoice] = useState<CryptoInvoice | null>(null)
  const [now, setNow] = useState(0)
  const [ready, setReady] = useState(false)

  const amount = Number(amountText)
  const validAmount = Number.isFinite(amount) && amount > 0
  const activeCoin = coin === 'OTHER' ? otherCoin.trim().toUpperCase() : coin
  const expiresAt = invoice ? Date.parse(invoice.expiresAt) : 0
  const remaining = expiresAt - now
  const expired = !!invoice && (!Number.isFinite(expiresAt) || remaining <= 0)

  // Restore browser-only payment state after hydration so the server markup stays stable.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const flow = JSON.parse(saved) as Partial<SavedFlow>
        if (['amount', 'method', 'coin', 'invoice'].includes(flow.step ?? '') && typeof flow.amountText === 'string') {
          const restoredInvoice = flow.invoice && typeof flow.invoice.address === 'string' && typeof flow.invoice.expiresAt === 'string'
            ? flow.invoice as CryptoInvoice
            : null
          setStep(flow.step === 'invoice' && !restoredInvoice ? 'amount' : flow.step as Step)
          setAmountText(flow.amountText)
          if (typeof flow.coin === 'string') setCoin(flow.coin)
          if (typeof flow.otherCoin === 'string') setOtherCoin(flow.otherCoin)
          setInvoice(restoredInvoice)
        }
      }
    } catch {
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* Storage can be disabled by browser settings. */ }
    }
    setNow(Date.now())
    setReady(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return
    try {
      const flow: SavedFlow = { step, amountText, coin, otherCoin, invoice }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flow))
    } catch {
      // Continue the current deposit if browser storage is unavailable.
    }
  }, [ready, step, amountText, coin, otherCoin, invoice])

  useEffect(() => {
    if (!invoice) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [invoice])

  const stepIndex = ['amount', 'method', 'coin', 'invoice'].indexOf(step)

  function proceedToMethods() {
    if (!validAmount) {
      setNotice('Enter an amount greater than £0 to continue.')
      return
    }
    setNotice('')
    setStep('method')
  }

  async function generateInvoice() {
    if (!activeCoin) {
      setNotice('Choose or enter a cryptocurrency to continue.')
      return
    }
    setNotice('')
    const result = await run(
      () => createCryptoInvoice({ amountGbp: amount, coin: activeCoin, expiresInSeconds: 3600 }),
      'Could not create invoice'
    )
    if (!result) return
    try {
      const flow: SavedFlow = { step: 'invoice', amountText, coin, otherCoin, invoice: result }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flow))
    } catch {
      // The invoice remains usable in this tab if storage is unavailable.
    }
    setInvoice(result)
    setNow(Date.now())
    setStep('invoice')
  }

  async function copyAddress() {
    if (!invoice) return
    try {
      await navigator.clipboard.writeText(invoice.address)
      toast.success('Address copied')
    } catch {
      toast.error('Could not copy address', 'Select the address and copy it manually.')
    }
  }

  if (!ready) {
    return (
      <Wrap>
        <Intro><h1>Add credits</h1><p>Deposit funds to your messaging account.</p></Intro>
        <Panel title="Deposit"><PanelBody>Loading your deposit…</PanelBody></Panel>
      </Wrap>
    )
  }

  return (
    <Wrap>
      <Intro><h1>Add credits</h1><p>Deposit funds to your messaging account.</p></Intro>
      <Steps aria-label="Deposit steps">
        {([
          { label: 'Amount', icon: FiDollarSign },
          { label: 'Payment', icon: FiCreditCard },
          { label: 'Coin', icon: FiGlobe },
          { label: 'Invoice', icon: FiFileText },
        ] as const).map(({ label, icon: Icon }, index) => (
          <span key={label} style={{ display: 'contents' }}>
            <StepItem $active={index === stepIndex} $done={index < stepIndex} aria-current={index === stepIndex ? 'step' : undefined}>
              <i aria-hidden="true"><Icon /></i>{label}
            </StepItem>
            {index < 3 && <StepLine $done={index < stepIndex} />}
          </span>
        ))}
      </Steps>

      {step === 'amount' && (
        <Panel title="Deposit amount" subtitle="Choose the GBP amount you want to add.">
          <PanelBody>
            <Recommendation>
              <FiAlertTriangle aria-hidden="true" />
              <div><strong>Recommendation: deposit the exact invoice amount.</strong>If the amount differs, your payment will be held and you will need to contact support.</div>
            </Recommendation>
            <CurrencyLabel id="deposit-currency-label">Amount (GBP)</CurrencyLabel>
            <AmountWrap>
              <span aria-hidden="true">£</span>
              <input
                id="deposit-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amountText}
                aria-labelledby="deposit-currency-label"
                onChange={(event) => {
                  const next = event.target.value
                  if (/^\d*\.?\d{0,2}$/.test(next)) setAmountText(next)
                  setNotice('')
                }}
                onKeyDown={(event) => { if (event.key === 'Enter') proceedToMethods() }}
                aria-describedby={notice ? 'deposit-notice' : undefined}
              />
            </AmountWrap>
            {notice && <Notice id="deposit-notice" $error>{notice}</Notice>}
            <ButtonRow>
              <span />
              <ActionButton type="button" onClick={proceedToMethods}>Proceed</ActionButton>
            </ButtonRow>
          </PanelBody>
        </Panel>
      )}

      {step === 'method' && (
        <Panel title="Choose payment method" subtitle="Maintenance status is shown for temporarily unavailable methods.">
          <PanelBody>
            <AmountSummary><span>Deposit amount</span><strong>£{amount.toFixed(2)} GBP</strong></AmountSummary>
            <Methods>
              <Method type="button" onClick={() => setNotice('PayPal is temporarily under maintenance. Please choose another payment method.')}>
                <FiBriefcase aria-hidden="true" />
                <strong>PayPal</strong><small>Under maintenance</small>
              </Method>
              <Method type="button" onClick={() => setNotice('Perfect Money is temporarily under maintenance. Please choose another payment method.')}>
                <FiDollarSign aria-hidden="true" />
                <strong>Perfect Money</strong><small>Under maintenance</small>
              </Method>
              <Method type="button" onClick={() => setNotice('Credit card payments are temporarily under maintenance. Please choose another payment method.')}>
                <FiCreditCard aria-hidden="true" />
                <strong>Credit card</strong><small>Under maintenance</small>
              </Method>
              <Method type="button" $selected onClick={() => { setNotice(''); setStep('coin') }}>
                <FiGlobe aria-hidden="true" />
                <strong>Cryptocurrency</strong><small>All cryptocurrencies accepted</small>
              </Method>
            </Methods>
            {notice && <Notice role="status">{notice}</Notice>}
            <ButtonRow><BackButton type="button" onClick={() => { setNotice(''); setStep('amount') }}>Back</BackButton><span /></ButtonRow>
          </PanelBody>
        </Panel>
      )}

      {step === 'coin' && (
        <Panel title="Choose cryptocurrency" subtitle="Select the coin you will send. The invoice will show the exact amount and address.">
          <PanelBody>
            <AmountSummary><span>GBP deposit</span><strong>£{amount.toFixed(2)} GBP</strong></AmountSummary>
            <CoinRow>
              <FieldLabel htmlFor="deposit-coin">Coin</FieldLabel>
              <Select id="deposit-coin" value={coin} onChange={(event) => setCoin(event.target.value)}>
                {coins.map((asset) => <option key={asset} value={asset}>{asset}</option>)}
                <option value="OTHER">Other cryptocurrency</option>
              </Select>
              {coin === 'OTHER' && (
                <>
                  <FieldLabel htmlFor="other-coin">Coin symbol</FieldLabel>
                  <CoinInput id="other-coin" value={otherCoin} onChange={(event) => setOtherCoin(event.target.value)} placeholder="Enter coin symbol, e.g. DOT" />
                </>
              )}
            </CoinRow>
            {notice && <Notice $error>{notice}</Notice>}
            <ButtonRow>
              <BackButton type="button" onClick={() => { setNotice(''); setStep('method') }}>Back</BackButton>
              <ActionButton type="button" disabled={pending} onClick={generateInvoice}>{pending ? 'Preparing invoice…' : 'Generate invoice'}</ActionButton>
            </ButtonRow>
          </PanelBody>
        </Panel>
      )}

      {step === 'invoice' && invoice && (
        <Panel title={expired ? 'Invoice expired' : 'Payment invoice'} subtitle={`Invoice ${invoice.id}`}>
          <PanelBody>
            <InvoiceStack>
              {invoice.isPreview && <PreviewBadge>Preview invoice</PreviewBadge>}
              {expired ? (
                <>
                  <ExpiredState role="status">
                    <FiClock aria-hidden="true" />
                    <strong>Invoice expired</strong>
                    <p>If you sent payment before expiry, it remains in processing until network confirmations complete, even if your credits have not appeared yet. If you did not send payment, create a new invoice before paying.</p>
                  </ExpiredState>
                  <AmountSummary><span>Invoice amount</span><strong>£{invoice.amountGbp.toFixed(2)} · {invoice.cryptoAmount} {invoice.coin}</strong></AmountSummary>
                </>
              ) : (
                <>
                  <InvoiceTop>
                    <InvoiceAmount><span>Send exactly</span><strong>{invoice.cryptoAmount} {invoice.coin}</strong><span>Network: {invoice.network}</span></InvoiceAmount>
                    <Timer $expired={false}>Expires in {formatRemaining(remaining)}</Timer>
                  </InvoiceTop>
                  <AddressBlock>
                    <label htmlFor="invoice-address">Payment address</label>
                    <Address id="invoice-address">{invoice.address}</Address>
                    <CopyButton type="button" onClick={copyAddress}>
                      <FiCopy aria-hidden="true" />
                      Copy address
                    </CopyButton>
                  </AddressBlock>
                  <Notice>Deposit amount: £{invoice.amountGbp.toFixed(2)} GBP. Send the exact crypto amount before the invoice expires. Credits are added after the payment is confirmed.</Notice>
                </>
              )}
              <ButtonRow>
                <BackButton type="button" disabled={pending} onClick={() => { setInvoice(null); setStep('coin') }}>Back</BackButton>
                {expired && <ActionButton type="button" onClick={() => { setInvoice(null); setStep('coin') }}>Create new invoice</ActionButton>}
              </ButtonRow>
            </InvoiceStack>
          </PanelBody>
        </Panel>
      )}
    </Wrap>
  )
}
