'use client'

import styled from 'styled-components'
import { theme as t } from '@/lib/theme'
import { FiAlertTriangle } from 'react-icons/fi'

const Box = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
  padding: 14px 16px;
  background: #fff8ea;
  border: 1px solid #f4dfb3;
  border-left: 3px solid #e6a238;
  border-radius: ${t.radius.md};
  font-family: ${t.font.body};
  font-size: 12px;
  line-height: 1.6;
  color: #5c4a1f;
  strong {
    display: block;
    margin-bottom: 2px;
    font-size: 13px;
    color: #3f3010;
  }
`
const IconSlot = styled.span`
  flex: none;
  margin-top: 2px;
  line-height: 0;
  svg { width: 18px; height: 18px; color: #e6a238; stroke-width: 2; }
`

export default function TestNotice() {
  return (
    <Box role="note">
      <IconSlot>
        <FiAlertTriangle aria-hidden="true" />
      </IconSlot>
      <div>
        <strong>Test before you mass-send</strong>
        Always send a test message before launching a campaign, even if the same one worked before. Detection errors are non-refundable, so a quick test protects your budget.
      </div>
    </Box>
  )
}
