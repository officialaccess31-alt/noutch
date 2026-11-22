import { getLog, load } from '@/lib/api'
import LoadError from '@/components/common/LoadError'
import LogDetails from '@/components/LogDetails'
import { Button, Content, PageHeader } from '@/components/ui'

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: log, error } = await load(getLog(id))

  return (
    <Content>
      <PageHeader
        title="Message details"
        subtitle={log ? `Sent ${log.date}` : 'Message delivery and reply information.'}
        action={<Button href="/logs">Back to logs</Button>}
      />
      {log ? <LogDetails log={log} /> : <LoadError message={error.message} status={error.status} />}
    </Content>
  )
}
