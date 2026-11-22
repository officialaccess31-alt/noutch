import { API_URL, ApiError, request } from '@/lib/http'

export type SignUpInput = {
  email: string
  username: string
  password: string
  telegramUsername?: string
}

export type LoginInput = { username: string; password: string }

export type AuthResult = {
  success: true
  message: string
  user: { id: string; username: string; email: string; telegramUsername?: string }
  session?: { authenticated: true; expiresIn: number }
}

export type CurrentUser = {
  id?: string
  username?: string
  name?: string
  email?: string
  plan?: string
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!API_URL) return null
  const response = await request<Record<string, unknown>>('/auth/me')
  const nestedUser = response.user
  const user = nestedUser && typeof nestedUser === 'object'
    ? nestedUser as Record<string, unknown>
    : response
  const planValue = user.plan ?? user.license ?? user.subscription
  const plan = planValue && typeof planValue === 'object'
    ? (planValue as Record<string, unknown>).name
    : planValue

  return {
    id: typeof user.id === 'string' ? user.id : undefined,
    username: typeof user.username === 'string' ? user.username : undefined,
    name: [user.name, user.full_name, user.display_name].find((value): value is string => typeof value === 'string'),
    email: typeof user.email === 'string' ? user.email : undefined,
    plan: typeof plan === 'string' ? plan : undefined,
  }
}

export async function logOut(): Promise<void> {
  if (API_URL) await request<void>('/auth/logout', { method: 'POST' })
}

// In-memory only: preview accounts are discarded when this browser tab reloads.
const previewAccounts = new Map<string, SignUpInput & { id: string }>()
previewAccounts.set('noutch_demo', {
  id: 'usr_demo_001',
  email: 'demo@noutch.example',
  username: 'noutch_demo',
  password: 'NoutchDemo26!',
})

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  if (API_URL) {
    return request<AuthResult>('/auth/register', {
      method: 'POST',
      redirectOnUnauthorized: false,
      body: {
        email: input.email,
        username: input.username,
        password: input.password,
        ...(input.telegramUsername ? { telegram_username: input.telegramUsername } : {}),
      },
    })
  }

  if (previewAccounts.has(input.username.toLowerCase())) {
    throw new ApiError('That username is already in use.', 409, { username: 'Choose another username.' })
  }

  const user = { ...input, id: `usr_preview_${Date.now()}` }
  previewAccounts.set(input.username.toLowerCase(), user)
  return {
    success: true,
    message: 'Preview account created. No data was sent to a server.',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.telegramUsername ? { telegramUsername: user.telegramUsername } : {}),
    },
  }
}

export async function logIn(input: LoginInput): Promise<AuthResult> {
  if (API_URL) {
    return request<AuthResult>('/auth/login', {
      method: 'POST',
      body: input,
      redirectOnUnauthorized: false,
    })
  }

  const user = previewAccounts.get(input.username.toLowerCase())
  if (!user || user.password !== input.password) {
    throw new ApiError('Username or password is incorrect.', 401)
  }

  return {
    success: true,
    message: 'Preview sign-in successful. No session was created on a server.',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.telegramUsername ? { telegramUsername: user.telegramUsername } : {}),
    },
    session: { authenticated: true, expiresIn: 3600 },
  }
}
