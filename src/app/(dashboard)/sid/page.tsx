import { getSids, load } from '@/lib/api'
import SidManager from '@/components/SidManager'
import LoadError from '@/components/common/LoadError'
import { Narrow } from '@/components/sms/styles'
import { Content, PageHeader } from '@/components/ui'

export default async function SidPage() {
  const { data: sids, error } = await load(getSids())

  return (
    <Content>
      <Narrow>
        <PageHeader eyebrow="Messaging" title="Get a sender ID" subtitle="Choose a region and request a sender ID for your account." />
        {sids ? <SidManager initialSids={sids} /> : <LoadError message={error.message} status={error.status} />}
      </Narrow>
    </Content>
  )
}
