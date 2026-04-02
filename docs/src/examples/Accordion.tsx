import React, { useState } from 'react'

const faqs = [
  {
    question: 'What is AgentKit?',
    answer:
      'AgentKit is a toolkit for building interactive UI components and agent-driven interfaces. It provides a collection of composable, accessible, and highly customizable components designed for modern web applications.',
  },
  {
    question: 'Which providers are supported?',
    answer:
      'AgentKit supports a wide range of providers including React, Vue, and Svelte. It integrates seamlessly with popular design systems and can be configured to work with your existing component library.',
  },
  {
    question: 'How do I install AgentKit?',
    answer:
      'You can install AgentKit via npm or yarn: `npm install @agentkit/core` or `yarn add @agentkit/core`. After installation, import the components you need and wrap your app with the AgentKitProvider.',
  },
  {
    question: 'Is AgentKit accessible?',
    answer:
      'Yes. AgentKit is built with accessibility in mind. All components follow WAI-ARIA guidelines, support keyboard navigation, and are compatible with major screen readers out of the box.',
  },
  {
    question: 'Can I customize the styles?',
    answer:
      'Absolutely. AgentKit components accept inline style overrides, className props, and CSS custom properties. You can also use any CSS-in-JS solution or Tailwind CSS to theme components to match your brand.',
  },
]

export function Accordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index))
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'inherit' }}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index

        return (
          <div
            key={index}
            style={{
              borderBottom: '1px solid #e5e7eb',
              borderTop: index === 0 ? '1px solid #e5e7eb' : undefined,
            }}
          >
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '16px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#111827',
                gap: 12,
              }}
            >
              <span>{faq.question}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: isOpen ? '#111827' : '#f3f4f6',
                  color: isOpen ? '#fff' : '#6b7280',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                  transition: 'background 0.2s, color 0.2s, transform 0.25s',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  userSelect: 'none',
                }}
              >
                +
              </span>
            </button>

            <div
              style={{
                overflow: 'hidden',
                maxHeight: isOpen ? 300 : 0,
                transition: 'max-height 0.35s ease',
              }}
            >
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                  color: '#4b5563',
                }}
              >
                {faq.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
