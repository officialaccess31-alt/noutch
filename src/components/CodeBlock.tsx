'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme as t } from '@/lib/theme'
import type { CodeSample } from '@/lib/api-docs'

const Box = styled.div`
  background: #0a0a0a;
  border-radius: ${t.radius.lg};
  overflow: hidden;
`
const Head = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 50px;
  padding: 6px 76px 6px 10px;
  background: ${t.color.sidebar};
  .copy-button { position: absolute; top: 6px; right: 8px; }
`
const Tabs = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
`
const TabButton = styled.button<{ $active?: boolean }>`
  min-height: 38px;
  flex: none;
  padding: 0 12px;
  border: 0;
  border-radius: ${t.radius.sm};
  font: 600 13px ${t.font.body};
  cursor: pointer;
  color: ${({ $active }) => ($active ? t.color.white : t.color.sidebarText)};
  background: ${({ $active }) => ($active ? t.color.sidebarActive : 'transparent')};
  transition: background 0.18s ease, color 0.18s ease;
  &:hover {
    color: ${t.color.white};
    background: ${({ $active }) => ($active ? t.color.sidebarActive : t.color.sidebarHover)};
  }
`
const Pre = styled.pre`
  margin: 0;
  padding: 14px 0;
  max-width: 100%;
  max-height: 520px;
  overflow: auto;
  color: #e6e6e6;
  background: #191919;
  font: 13px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  tab-size: 2;
  .code-line { display: grid; grid-template-columns: 48px max-content; min-width: 100%; }
  .line-number { padding: 0 14px 0 8px; color: #686868; text-align: right; user-select: none; }
  .line-content { padding-right: 24px; white-space: pre; }
  .token-keyword { color: #c792ea; }
  .token-string { color: #ce9178; }
  .token-comment { color: #6a9955; }
  .token-number { color: #b5cea8; }
  .token-function { color: #dcdcaa; }
  .token-type { color: #4ec9b0; }
  .token-variable { color: #9cdcfe; }
  .token-punctuation { color: #b8b8b8; }
  @media (max-width: ${t.mobile}) {
    font-size: 12px;
    max-height: 65vh;
    .code-line { grid-template-columns: 40px max-content; }
    .line-number { padding-right: 10px; }
  }
`

const keywords = new Set([
  'as', 'async', 'await', 'break', 'catch', 'class', 'const', 'continue', 'def', 'defer',
  'else', 'enum', 'export', 'false', 'fn', 'for', 'from', 'func', 'function', 'if', 'impl',
  'import', 'in', 'let', 'match', 'mut', 'new', 'null', 'package', 'pub', 'raise', 'return',
  'self', 'static', 'throw', 'true', 'try', 'use', 'var', 'with', 'None', 'True', 'False',
  'Ok', 'Err',
])

function highlightLine(line: string, language: string) {
  const hashComments = ['Python', 'Ruby', 'cURL'].includes(language)
  const commentPattern = hashComments ? String.raw`(?:\/\/|#)[^\n]*` : String.raw`(?:\/\/|\/\*[\s\S]*?\*\/)`
  const tokenPattern = new RegExp(
    `${commentPattern}|\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|\\x60(?:\\\\.|[^\\x60\\\\])*\\x60|\\$[\\w]+|\\b\\d+(?:\\.\\d+)?\\b|\\b[A-Za-z_][\\w]*\\b|[{}()[\\].,:;]|\\s+|.`,
    'g',
  )

  return Array.from(line.matchAll(tokenPattern), (match, index) => {
    const token = match[0]
    let kind = ''
    if (token.startsWith('//') || token.startsWith('/*') || (hashComments && token.startsWith('#'))) kind = 'comment'
    else if (/^(?:"|'|`)/.test(token)) kind = 'string'
    else if (/^\$[\w]+$/.test(token)) kind = 'variable'
    else if (/^\d/.test(token)) kind = 'number'
    else if (/^[{}()[\].,:;]$/.test(token)) kind = 'punctuation'
    else if (/^[A-Za-z_]\w*$/.test(token)) {
      const next = line.slice((match.index ?? 0) + token.length).match(/^\s*(.)/)?.[1]
      if (keywords.has(token)) kind = 'keyword'
      else if (next === '(') kind = 'function'
      else if (/^[A-Z]/.test(token)) kind = 'type'
    }
    return kind ? <span className={`token-${kind}`} key={`${match.index}-${index}`}>{token}</span> : token
  })
}

export default function CodeBlock({ samples }: { samples: CodeSample[] }) {
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const current = samples[index]

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard needs https or localhost
    }
  }

  return (
    <Box>
      <Head>
        <Tabs role="tablist" aria-label="Code language">
          {samples.map((s, i) => (
            <TabButton
              key={s.language}
              type="button"
              role="tab"
              aria-selected={i === index}
              $active={i === index}
              onClick={() => setIndex(i)}
            >
              {s.language}
            </TabButton>
          ))}
        </Tabs>
        <TabButton className="copy-button" type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </TabButton>
      </Head>
      <Pre role="tabpanel" aria-label={`${current.language} code example`}>
        <code>{current.code.split('\n').map((line, lineIndex) => (
          <span className="code-line" key={lineIndex}>
            <span className="line-number" aria-hidden="true">{lineIndex + 1}</span>
            <span className="line-content">{highlightLine(line, current.language)}</span>
          </span>
        ))}</code>
      </Pre>
    </Box>
  )
}
