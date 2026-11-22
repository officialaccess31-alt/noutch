'use client'

import { ActionButton, Content, PageHeader, Panel } from '@/components/ui'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Content>
      <PageHeader title="Overview" subtitle="A live view of your messaging activity and account health." />
      <Panel title="We could not load your overview" subtitle="Check your connection, then try again.">
        <div style={{ padding: 22 }}>
          <ActionButton type="button" onClick={reset}>
            Try again
          </ActionButton>
        </div>
      </Panel>
    </Content>
  )
}
