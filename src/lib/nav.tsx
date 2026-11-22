import type { ReactNode } from 'react'
import {
  FiCode, FiCreditCard, FiGitBranch, FiGrid, FiHelpCircle, FiInbox,
  FiList, FiMessageCircle, FiRadio, FiSend, FiShield,
} from 'react-icons/fi'

export type NavItem = { title: string; href: string; icon: ReactNode }

export const nav: NavItem[] = [
  { title: 'Overview', href: '/overview', icon: <FiGrid /> },
  { title: 'SMS', href: '/sms', icon: <FiSend /> },
  { title: 'SID', href: '/sid', icon: <FiRadio /> },
  { title: 'Logs', href: '/logs', icon: <FiList /> },
  { title: 'Inbound', href: '/inbound', icon: <FiInbox /> },
  { title: 'Credits', href: '/credits', icon: <FiCreditCard /> },
  { title: 'License', href: '/license', icon: <FiShield /> },
  { title: 'Route & Pricing', href: '/route-pricing', icon: <FiGitBranch /> },
  { title: 'API', href: '/api-keys', icon: <FiCode /> },
  { title: 'FAQ', href: '/faq', icon: <FiHelpCircle /> },
  { title: 'Support', href: '/community', icon: <FiMessageCircle /> },
]
