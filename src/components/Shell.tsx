'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { theme as t } from '@/lib/theme'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const Grid = styled.div`
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  @media (max-width: ${t.drawer}) {
    display: block;
  }
`
const Main = styled.main`
  min-width: 0;
  min-height: 0;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`
const PageViewport = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
`

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const mq = window.matchMedia(`(max-width: ${t.drawer})`)
    const onChange = () => {
      if (!mq.matches) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onChange)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onChange)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <Grid>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <Main>
        <Topbar open={open} onMenu={() => setOpen(true)} />
        <PageViewport>{children}</PageViewport>
      </Main>
    </Grid>
  )
}
