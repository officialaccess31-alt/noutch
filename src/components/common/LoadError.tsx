'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { ActionButton, Panel, PanelBody } from '@/components/ui'
import { theme as t } from '@/lib/theme'

const Message = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  color: ${t.color.muted};
  word-break: break-word;
`

// Shown by any server page when its data fails to load. The message comes from the backend.
export default function LoadError({ message, status }: { message: string; status: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Panel title={status === 0 ? 'Cannot reach the server' : 'We could not load this page'}>
      <PanelBody>
        <Message>{message}</Message>
        <ActionButton type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
          {pending ? 'Trying…' : 'Try again'}
        </ActionButton>
      </PanelBody>
    </Panel>
  )
}
