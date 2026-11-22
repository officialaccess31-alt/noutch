import { getInbound, load } from '@/lib/api'
import LoadError from '@/components/common/LoadError'
import { Content, EmptyRow, PageHeader, Pager, Panel, Table, Truncate } from '@/components/ui'

export default async function InboundPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const { data, error } = await load(getInbound(current))

  return (
    <Content>
      <PageHeader title="Inbound" subtitle="Messages and replies your account has received." />

      {data ? (
        <Panel title="Received messages" subtitle={`${data.items.length} message${data.items.length === 1 ? '' : 's'} on this page`}>
          <Table headers={['Received', 'From', 'To', 'Message']}>
            {data.items.length === 0 ? (
              <tr><EmptyRow colSpan={4}>No inbound messages yet.</EmptyRow></tr>
            ) : data.items.map((message) => (
              <tr key={message.id}>
                <td>{message.date}</td>
                <td>{message.from}</td>
                <td>{message.to}</td>
                <td><Truncate translate="no" title={message.message}>{message.message}</Truncate></td>
              </tr>
            ))}
          </Table>
          <Pager page={current} hasMore={data.hasMore} basePath="/inbound" />
        </Panel>
      ) : <LoadError message={error.message} status={error.status} />}
    </Content>
  )
}
