'use client'

import { faqs } from '@/lib/faq'
import { Accordion, AccordionItem, Content, PageHeader } from '@/components/ui'
import { useLocale } from '@/lib/i18n'

export default function FaqPage() {
  const { t: tr } = useLocale()
  return (
    <Content>
      <PageHeader title="FAQ" subtitle="Quick answers to common questions." />

      <Accordion>
        {faqs.map((f) => (
          <AccordionItem key={f.question}>
            <summary>{tr(f.question)}</summary>
            <p>{tr(f.answer)}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </Content>
  )
}
