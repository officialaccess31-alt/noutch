'use client'

import styled, { css } from 'styled-components'
import { CheckRow, Field, Textarea } from '@/components/ui'
import { theme as t } from '@/lib/theme'

const RED = '#e5484d'
const RED_SOFT = '#fdecec'

const invalid = css<{ $invalid?: boolean }>`
  ${({ $invalid }) =>
    $invalid &&
    css`
      border-color: ${RED};
      &:focus {
        border-color: ${RED};
        box-shadow: 0 0 0 3px ${RED_SOFT};
      }
    `}
`

/* Layout */
export const Narrow = styled.div`
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
`
export const Tight = styled(Field)`
  margin-bottom: 14px;
`
export const Row3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: ${t.mobile}) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`

/* Inputs: your Select and Textarea from ui, plus an error state */
export const TextareaField = styled(Textarea)<{ $invalid?: boolean }>`
  ${invalid}
  min-height: 80px;
  max-height: 220px;
  resize: none;
  overflow: hidden;
  @media (max-width: ${t.mobile}) {
    max-height: 160px;
  }
`
export const MessageField = styled(TextareaField)`
  min-height: 110px;
`

export const FieldError = styled.div`
  margin-top: 6px;
  font-size: 11px;
  color: #9b2c2c;
`

/* Character rules: small, quiet, no box */
export const InfoNote = styled.p`
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: ${t.color.muted};
`

/* Attachments: two small buttons and their chips */
export const AttachRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: -2px 0 16px;
`
export const AttachButton = styled.button`
  min-height: 38px;
  padding: 0 14px;
  font: 600 12px ${t.font.body};
  color: #262626;
  background: #f4f4f5;
  border: 1px solid #d4d4d4;
  border-radius: ${t.radius.sm};
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
  &:hover {
    background: #f4f4f5;
    border-color: #d4d4d4;
  }
  &:focus-visible {
    outline: 2px solid ${t.color.primary};
    outline-offset: 2px;
  }
`
export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 4px 6px 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #404040;
  background: #f4f4f5;
  border-radius: 20px;

  img {
    width: 22px;
    height: 22px;
    object-fit: cover;
    border-radius: 6px;
    margin-left: -4px;
  }
  span {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  button {
    border: 0;
    background: transparent;
    color: ${t.color.primary};
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
    padding: 0 4px;
  }
`

/* Bottom row: test checkbox on the left, send button on the right */
export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`
export const TestRow = styled(CheckRow)`
  margin: 0;
`
