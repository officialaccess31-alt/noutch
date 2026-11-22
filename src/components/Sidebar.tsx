'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FiLogOut } from 'react-icons/fi'
import styled from 'styled-components'
import { theme as t } from '@/lib/theme'
import { nav } from '@/lib/nav'
import { useLocale } from '@/lib/i18n'
import { getCurrentUser, logOut, type CurrentUser } from '@/lib/auth'
import { useToast } from '@/components/toast'
import { useHydrated } from '@/hooks/useHydrated'

const Overlay = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: ${t.drawer}) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0, 0, 0, 0.5);
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
    transition: opacity 0.25s ease;
  }
`

const Aside = styled.aside<{ $open: boolean }>`
  background: ${t.color.sidebar};
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  scrollbar-color: #525252 transparent;
  &::-webkit-scrollbar-thumb { background: #525252; }
  &::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }

  @media (max-width: ${t.drawer}) {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    height: auto;
    width: min(280px, 86vw);
    z-index: 50;
    transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
    visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
    box-shadow: ${({ $open }) => ($open ? '8px 0 32px rgba(0, 0, 0, 0.3)' : 'none')};
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0.3s, box-shadow 0.3s;
  }
`
const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 3px 10px 28px;
  color: ${t.color.white};
  font: 700 19px ${t.font.display};
  letter-spacing: -0.5px;
`
const Mark = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #ffffff;
  color: #0a0a0a;
  display: grid;
  place-items: center;
  font-size: 17px;
`
const NavList = styled.nav`
  display: grid;
  gap: 4px;
`
const NavLink = styled(Link)<{ $active: boolean }>`
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: ${t.radius.sm};
  font-size: 13px;
  text-decoration: none;
  color: ${({ $active }) => ($active ? t.color.white : t.color.sidebarText)};
  background: ${({ $active }) => ($active ? t.color.sidebarActive : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? `inset 3px 0 ${t.color.sidebarAccent}` : 'none')};
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    background: ${({ $active }) => ($active ? t.color.sidebarActive : t.color.sidebarHover)};
    color: ${t.color.white};
  }
  svg {
    width: 18px;
    height: 18px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`
const UserBox = styled.div`
  padding: 16px 8px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`
const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #171717;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 12px;
`
const UserName = styled.div`
  min-width: 0;
  color: ${t.color.white};
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  small {
    display: block;
    color: #a3a3a3;
    font-weight: 400;
    margin-top: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
const AccountArea = styled.div`
  margin-top: auto;
  border-top: 1px solid #ffffff1c;
  padding-top: 4px;
`
const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid #2c2c2c;
  border-radius: ${t.radius.sm};
  background: #1d1d1d;
  color: #dedede;
  font: 500 12px ${t.font.body};
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
  &:hover:not(:disabled) { background: #292929; color: ${t.color.white}; }
  &:disabled { opacity: .65; cursor: wait; }
  svg { width: 16px; height: 16px; }
`

function Navigation({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const { t: tr } = useLocale()
  return (
    <NavList aria-label={tr('Main')}>
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <NavLink
            key={item.href}
            href={item.href}
            $active={active}
            onClick={onClose}
            aria-current={active ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {tr(item.title)}
          </NavLink>
        )
      })}
    </NavList>
  )
}

function ActiveNavigation({ onClose }: { onClose: () => void }) {
  const pathname = usePathname() ?? ''
  const mounted = useHydrated()
  return <Navigation pathname={mounted ? pathname : ''} onClose={onClose} />
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t: tr } = useLocale()
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((profile) => { if (active) setUser(profile) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setLoadingUser(false) })
    return () => { active = false }
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logOut()
      router.replace('/login')
    } catch (error) {
      toast.error('Could not sign out', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  const displayName = user?.name || user?.username || user?.email || (loadingUser ? tr('Loading profile') : tr('Account'))
  const secondary = user?.plan || user?.email || (loadingUser ? tr('Loading profile') : tr('Profile unavailable'))
  const initials = displayName.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'

  return (
    <>
      <Overlay $open={open} onClick={onClose} aria-hidden="true" />
      <Aside id="sidebar" $open={open}>
        <Brand>
          <Mark>N</Mark>
          Noutch
        </Brand>

        <Suspense fallback={<Navigation pathname="" onClose={onClose} />}>
          <ActiveNavigation onClose={onClose} />
        </Suspense>

        <AccountArea>
          <UserBox>
            <Avatar aria-hidden="true">{initials}</Avatar>
            <UserName title={displayName}>
              {displayName}
              <small title={secondary}>{secondary}</small>
            </UserName>
          </UserBox>
          <LogoutButton type="button" onClick={handleLogout} disabled={loggingOut}>
            <FiLogOut aria-hidden="true" />
            {loggingOut ? tr('Signing out…') : tr('Log out')}
          </LogoutButton>
        </AccountArea>
      </Aside>
    </>
  )
}
