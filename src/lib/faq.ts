// FAQ page data. Replace with your real questions and answers.
export type FaqItem = { question: string; answer: string }

export const faqs: FaqItem[] = [
  {
    question: 'Which route should I use to reach my audience?',
    answer: 'Choose a route based on where your recipients are. Check Route & Pricing for country availability and per-SMS rates, then send a small test to confirm delivery.',
  },
  {
    question: 'Why can a message show as sent but not arrive?',
    answer: 'Sent means the message was accepted for delivery. The carrier may still reject or delay it. Check the message status in Logs, confirm the number and country code, and review the route.',
  },
  {
    question: 'How can I improve message delivery?',
    answer: 'Use valid, opted-in numbers, choose the correct country route, and keep your sender ID and message content compliant with local carrier rules. Test first and review delivery results in Logs.',
  },
  {
    question: 'How should I test a campaign before sending it in bulk?',
    answer: 'Use the test-message option and send to a small set of numbers you control or have permission to contact. Check formatting, links, sender display, and delivery status before sending to the full list.',
  },
  {
    question: 'What is the daily sending limit on the Regular plan?',
    answer: 'Regular supports up to 5,000 SMS per day. Messages still use account credits at the applicable country rate.',
  },
  {
    question: 'What is the daily sending limit on the Advanced plan?',
    answer: 'Advanced has no daily message cap. SMS still uses credits, and delivery speed depends on the selected route.',
  },
  {
    question: 'Can I connect the service to my own app with an API?',
    answer: 'Yes. API access is included with Advanced and Elite. Find the base URL, key, and integration examples on the API page.',
  },
]
