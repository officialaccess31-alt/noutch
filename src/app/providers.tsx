'use client'

import React, { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager, createGlobalStyle } from 'styled-components'
import { theme as t } from '@/lib/theme'
import { ToastProvider } from '@/components/toast'
import { LocaleProvider } from '@/lib/i18n'

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: ${t.color.paper};
    color: ${t.color.ink};
    font-family: ${t.font.body};
    -webkit-tap-highlight-color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`

export default function Providers({ children }: { children: React.ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement()
    sheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') {
    return (
      <LocaleProvider>
        <ToastProvider>
          <GlobalStyle />
          {children}
        </ToastProvider>
      </LocaleProvider>
    )
  }

  return (
    <StyleSheetManager sheet={sheet.instance}>
      <LocaleProvider>
        <ToastProvider>
          <GlobalStyle />
          {children}
        </ToastProvider>
      </LocaleProvider>
    </StyleSheetManager>
  )
}
