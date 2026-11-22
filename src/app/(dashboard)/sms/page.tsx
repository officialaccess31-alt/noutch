import { getSmsOptions, load } from '@/lib/api'
import SmsForm from '@/components/SmsForm'
import LoadError from '@/components/common/LoadError'
import TestNotice from '@/components/sms/TestNotice'
import { Narrow } from '@/components/sms/styles'
import { Content, PageHeader, Panel, PanelBody } from '@/components/ui'

export default async function SmsPage() {
  const { data: options, error } = await load(getSmsOptions())

  return (
    <Content>
      <Narrow>
        <PageHeader eyebrow="Messaging" title="Send SMS" subtitle="Write your message, choose recipients and send." />
        {options ? (
          <>
            <TestNotice />
            <Panel title="New message">
              <PanelBody>
                <SmsForm options={options} />
              </PanelBody>
            </Panel>
          </>
        ) : (
          <LoadError message={error.message} status={error.status} />
        )}
      </Narrow>
    </Content>
  )
}
