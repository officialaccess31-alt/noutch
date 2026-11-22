import { getRoutes } from '@/lib/api'
import RoutePricingList from '@/components/RoutePricingList'
import { Content, PageHeader, Panel } from '@/components/ui'

export default async function RoutePricingPage() {
  const routes = await getRoutes()

  return (
    <Content>
      <PageHeader title="Route & Pricing" subtitle="Check availability and SMS rates by country." />

      <Panel title="Countries and rates">
          {routes.length === 0 ? (
            <div style={{ padding: '28px 20px', color: '#737373', textAlign: 'center', fontSize: 12 }}>No routes available.</div>
          ) : <RoutePricingList routes={routes} />}
      </Panel>
    </Content>
  )
}
