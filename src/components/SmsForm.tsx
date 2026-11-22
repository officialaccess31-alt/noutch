'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { sendSms, type SmsOptions } from '@/lib/api'
import { MAX_CHARS, MAX_FILE_MB, MAX_IMAGE_MB } from '@/lib/sms/constants'
import { parseNumbers } from '@/lib/sms/parseNumbers'
import { useApiAction } from '@/hooks/useApiAction'
import { useToast } from '@/components/toast'
import { useLocale } from '@/lib/i18n'
import { FiX } from 'react-icons/fi'
import { Hint, Label, SubmitButton } from '@/components/ui'
import SelectControl from '@/components/sms/SelectControl'
import {
  AttachButton, AttachRow, Chip, FieldError, Footer, InfoNote, MessageField,
  Row3, TestRow, TextareaField, Tight,
} from '@/components/sms/styles'

type Errors = Partial<Record<'campaignType' | 'sid' | 'route' | 'message' | 'recipients', string>>

// Maps backend field names to our form fields.
const FIELD_ALIASES: Record<string, keyof Errors> = {
  campaignType: 'campaignType', campaign_type: 'campaignType',
  sid: 'sid', sender_id: 'sid',
  route: 'route',
  message: 'message', body: 'message',
  recipients: 'recipients', numbers: 'recipients', to: 'recipients',
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

function resizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = 'auto'
  const contentHeight = element.scrollHeight
  const maxHeight = Number.parseFloat(window.getComputedStyle(element).maxHeight)
  const height = Number.isFinite(maxHeight) ? Math.min(contentHeight, maxHeight) : contentHeight
  element.style.height = `${height}px`
  element.style.overflowY = contentHeight > height ? 'auto' : 'hidden'
}

export default function SmsForm({ options }: { options: SmsOptions }) {
  const toast = useToast()
  const { language } = useLocale()
  const { run, pending, fieldErrors } = useApiAction()
  const fileInput = useRef<HTMLInputElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  const recipientsTextarea = useRef<HTMLTextAreaElement>(null)
  const messageTextarea = useRef<HTMLTextAreaElement>(null)
  const previewUrl = useRef<string | null>(null)

  const [campaignType, setCampaignType] = useState(options.campaignTypes[0]?.value ?? '')
  const [sid, setSid] = useState(options.sids[0]?.value ?? '')
  const [route, setRoute] = useState(options.routes[0]?.value ?? '')
  const [message, setMessage] = useState('')
  const [typed, setTyped] = useState('')
  const [file, setFile] = useState<{ name: string; text: string } | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [test, setTest] = useState(false)
  const [localErrors, setLocalErrors] = useState<Errors>({})

  // Local errors + backend field errors, merged
  const errors: Errors = { ...localErrors }
  for (const [key, msg] of Object.entries(fieldErrors)) {
    const field = FIELD_ALIASES[key]
    if (field) errors[field] = msg
  }

  // Release the object URL when the form unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    }
  }, [])

  useEffect(() => {
    const resize = () => {
      if (recipientsTextarea.current) resizeTextarea(recipientsTextarea.current)
      if (messageTextarea.current) resizeTextarea(messageTextarea.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const numbers = useMemo(() => parseNumbers(`${typed}\n${file?.text ?? ''}`), [typed, file])

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return

    if (!/\.(txt|csv)$/i.test(picked.name)) {
      toast.error('Unsupported file', 'Upload a .txt or .csv file with one number per line.')
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error('File too large', `Keep the file under ${MAX_FILE_MB} MB.`)
      return
    }
    try {
      const text = await picked.text()
      setFile({ name: picked.name, text })
      setLocalErrors((cur) => ({ ...cur, recipients: undefined }))
      toast.success('File loaded', `${new Intl.NumberFormat(language).format(parseNumbers(text).valid.length)} valid numbers found in ${picked.name}.`)
    } catch {
      toast.error('Could not read the file', 'Try again or paste the numbers instead.')
    }
  }

  function onPickImage(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return

    if (!IMAGE_TYPES.includes(picked.type)) {
      toast.error('Unsupported image', 'Use a JPG, PNG or GIF image.')
      return
    }
    if (picked.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error('Image too large', `Keep the image under ${MAX_IMAGE_MB} MB.`)
      return
    }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    previewUrl.current = URL.createObjectURL(picked)
    setPreview(previewUrl.current)
    setImage(picked)
  }

  function removeImage() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    previewUrl.current = null
    setPreview(null)
    setImage(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    const next: Errors = {}
    if (!campaignType) next.campaignType = 'Choose a campaign type.'
    if (!sid) next.sid = 'Choose a sender ID.'
    if (!route) next.route = 'Choose a route.'
    if (!message.trim()) next.message = 'Write a message.'
    else if (message.length > MAX_CHARS) next.message = `Message is over the ${MAX_CHARS} character limit.`
    if (numbers.valid.length === 0) next.recipients = 'Add at least one valid phone number.'

    setLocalErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error('Check the form', 'Fix the highlighted fields and try again.')
      return
    }

    const res = await run(
      () => sendSms({ campaignType, sid, route, recipients: numbers.valid, message: message.trim(), test, image }),
      'Message not sent'
    )
    if (!res) return

    toast.success(
      test ? 'Test message sent' : 'Message sent',
      res.message ?? `Queued for ${new Intl.NumberFormat(language).format(numbers.valid.length)} recipient(s).`
    )
    setMessage('')
    setTyped('')
    if (messageTextarea.current) {
      messageTextarea.current.style.height = ''
      messageTextarea.current.style.overflowY = 'hidden'
    }
    if (recipientsTextarea.current) {
      recipientsTextarea.current.style.height = ''
      recipientsTextarea.current.style.overflowY = 'hidden'
    }
    setFile(null)
    removeImage()
    setTest(false)
    setLocalErrors({})
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Row3>
        <Tight>
          <Label htmlFor="sms-campaign">Campaign type</Label>
          <SelectControl id="sms-campaign" value={campaignType} options={options.campaignTypes} onChange={setCampaignType} disabled={options.campaignTypes.length === 0} invalid={!!errors.campaignType} describedBy={errors.campaignType ? 'sms-campaign-error' : undefined} />
          {errors.campaignType && <FieldError id="sms-campaign-error">{errors.campaignType}</FieldError>}
        </Tight>

        <Tight>
          <Label htmlFor="sms-sid">Sender ID</Label>
          <SelectControl id="sms-sid" value={sid} options={options.sids} onChange={setSid} disabled={options.sids.length === 0} invalid={!!errors.sid} describedBy={errors.sid ? 'sms-sid-error' : undefined} />
          {errors.sid && <FieldError id="sms-sid-error">{errors.sid}</FieldError>}
        </Tight>

        <Tight>
          <Label htmlFor="sms-route">Route</Label>
          <SelectControl id="sms-route" value={route} options={options.routes} onChange={setRoute} disabled={options.routes.length === 0} invalid={!!errors.route} describedBy={errors.route ? 'sms-route-error' : undefined} />
          {errors.route && <FieldError id="sms-route-error">{errors.route}</FieldError>}
        </Tight>
      </Row3>

      <Tight>
        <Label htmlFor="sms-recipients">Recipients</Label>
        <TextareaField
          ref={recipientsTextarea}
          id="sms-recipients"
          aria-invalid={!!errors.recipients}
          aria-describedby={errors.recipients ? 'sms-recipients-error' : undefined}
          placeholder="Paste numbers separated by commas, spaces or new lines"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value)
            resizeTextarea(e.currentTarget)
          }}
          $invalid={!!errors.recipients}
        />
        <Hint>
          <span>
            {new Intl.NumberFormat(language).format(numbers.valid.length)} valid number{numbers.valid.length === 1 ? '' : 's'}
            {numbers.invalid.length > 0 && ` · ${numbers.invalid.length} invalid will be skipped`}
            {numbers.duplicates > 0 && ` · ${numbers.duplicates} duplicate${numbers.duplicates === 1 ? '' : 's'} removed`}
          </span>
        </Hint>
        {errors.recipients && <FieldError id="sms-recipients-error">{errors.recipients}</FieldError>}
      </Tight>

      <AttachRow>
        <input ref={fileInput} type="file" accept=".txt,.csv,text/plain" hidden onChange={onPickFile} />
        <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/gif" hidden onChange={onPickImage} />

        <AttachButton type="button" onClick={() => fileInput.current?.click()}>+ Numbers file (.txt)</AttachButton>
        <AttachButton type="button" onClick={() => imageInput.current?.click()}>+ Image</AttachButton>

        {file && (
          <Chip>
            <span title={file.name}>{file.name}</span>
            <button type="button" aria-label="Remove numbers file" onClick={() => setFile(null)}><FiX aria-hidden="true" /></button>
          </Chip>
        )}
        {image && preview && (
          <Chip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" />
            <span title={image.name}>{image.name}</span>
            <button type="button" aria-label="Remove image" onClick={removeImage}><FiX aria-hidden="true" /></button>
          </Chip>
        )}
      </AttachRow>

      <Tight>
        <Label htmlFor="sms-message">Message</Label>
        <MessageField
          ref={messageTextarea}
          id="sms-message"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'sms-message-error' : undefined}
          placeholder="Type your message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            resizeTextarea(e.currentTarget)
          }}
          $invalid={!!errors.message}
        />
        {errors.message && <FieldError id="sms-message-error">{errors.message}</FieldError>}
        <InfoNote>
          Up to {MAX_CHARS} characters. Outside the United States, one SMS holds up to 160 characters. Longer messages are split and charged as multiple SMS.
          Outside the US and Canada, messages must be 30–180 characters.
        </InfoNote>
      </Tight>

      <Footer>
        <TestRow>
          <input type="checkbox" checked={test} onChange={(e) => setTest(e.target.checked)} />
          Send as a test message
        </TestRow>
        <SubmitButton type="submit" disabled={pending}>
          {pending ? 'Sending…' : test ? 'Send test' : 'Send message'}
        </SubmitButton>
      </Footer>
    </form>
  )
}
