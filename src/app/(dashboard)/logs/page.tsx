import { getLogs } from '@/lib/api'
import LogsTable from '@/components/LogsTable'
import { Content, PageHeader, Pager, Panel } from '@/components/ui'

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const { items, hasMore } = await getLogs(current)

  return (
    <Content>
      <PageHeader title="Logs" subtitle="Every message you have sent and its delivery status." />

      <Panel title="Message log">
        <LogsTable items={items} />
        <Pager page={current} hasMore={hasMore} basePath="/logs" />
      </Panel>
    </Content>
  )
}
