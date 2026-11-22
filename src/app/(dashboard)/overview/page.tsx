import { getOverview } from '@/lib/api'
import SmsAnalyticsChart from '@/components/SmsAnalyticsChart'
import DailySendingLimit from '@/components/DailySendingLimit'
import { Button, Content, PageHeader } from '@/components/ui'

export default async function OverviewPage() {
  const { analytics, dailyUsage } = await getOverview()

  return (
    <Content>
      <PageHeader
        title="Overview"
        subtitle="A live view of your messaging activity and account health."
        action={<Button href="/sms">Send SMS</Button>}
      />

      <SmsAnalyticsChart data={analytics} />
      <DailySendingLimit usage={dailyUsage} />
    </Content>
  )
}
