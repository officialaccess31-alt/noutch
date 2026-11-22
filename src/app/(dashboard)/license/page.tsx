import LicensePlans from '@/components/LicensePlans'
import { Content, PageHeader } from '@/components/ui'

export default function LicensePage() {
  return (
    <Content>
      <PageHeader title="Find your sending plan" subtitle="Compare annual plans and choose the right fit for your messaging." />
      <LicensePlans />
    </Content>
  )
}
