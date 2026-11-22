import { apiInfo, buildSamples } from '@/lib/api-docs'
import CopyField from '@/components/CopyField'
import CodeBlock from '@/components/CodeBlock'
import { Content, Hint, PageHeader, Panel, PanelBody, Table } from '@/components/ui'

export default function ApiPage() {
  return (
    <Content>
      <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto', display: 'grid', gap: 20 }}>
        <PageHeader title="API" subtitle="Use these details to connect your own system." />

        <Panel title="API access">
          <PanelBody>
            <CopyField label="Base URL" value={apiInfo.baseUrl} />
            <CopyField label="API key" value={apiInfo.apiKey} secret />
            <Hint>
              <span>Keep your API key private. Never share it or put it in public code.</span>
            </Hint>
          </PanelBody>
        </Panel>

        <Panel title="Code examples" subtitle="Send an SMS from your own code">
          <PanelBody>
            <CodeBlock samples={buildSamples(apiInfo.baseUrl)} />
          </PanelBody>
        </Panel>

        <Panel title="Sender ID endpoints" subtitle="The dashboard uses these endpoints to request and track sender IDs.">
          <Table headers={['Method', 'Endpoint', 'Request / response']}>
            <tr>
              <td><code>GET</code></td>
              <td><code>/sids</code></td>
              <td>Returns the account’s sender ID list.</td>
            </tr>
            <tr>
              <td><code>POST</code></td>
              <td><code>/sids</code></td>
              <td><code>{'{ region, senderName? }'}</code>; region is <code>usa</code>, <code>canada</code> or <code>eu_uk_custom</code>.</td>
            </tr>
            <tr>
              <td><code>DELETE</code></td>
              <td><code>/sids/:id</code></td>
              <td>Deletes the selected sender ID.</td>
            </tr>
          </Table>
          <PanelBody>
            <Hint>
              <span>Return a new SID with status Active, Activating or Rejected. EU / UK requests include senderName; USA and Canada requests are for standard numbers.</span>
            </Hint>
          </PanelBody>
        </Panel>
      </div>
    </Content>
  )
}
