// Central place for every API call and every error.
// Backend errors are read here once, so pages never parse them.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || null

const LOGIN_PATH = '/login' // change to your real login route
const TIMEOUT_MS = 15000

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// Used only when Django sends no message of its own.
const FALLBACKS: Record<number, string> = {
  400: 'Some of the information sent was not valid.',
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have permission to do this.',
  404: 'We could not find what you asked for.',
  408: 'The request took too long. Try again.',
  413: 'The data you sent is too large.',
  429: 'Too many requests. Wait a moment and try again.',
}

function fallbackFor(status: number) {
  if (FALLBACKS[status]) return FALLBACKS[status]
  if (status >= 500) return 'Something went wrong on our side. Try again shortly.'
  return 'Something went wrong. Try again.'
}

// Reads Django REST Framework errors:
// { detail } | { message } | { error } | { field: ["msg"] } | { non_field_errors: ["msg"] } | ["msg"]
function parseErrorBody(data: unknown): { message?: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {}
  if (!data) return { fields }
  if (typeof data === 'string') return { message: data, fields }
  if (Array.isArray(data)) return { message: String(data[0]), fields }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    let message: string | undefined

    for (const key of ['detail', 'message', 'error']) {
      if (typeof obj[key] === 'string') message = obj[key] as string
    }
    if (Array.isArray(obj.non_field_errors)) message = String(obj.non_field_errors[0])

    for (const [key, value] of Object.entries(obj)) {
      if (['detail', 'message', 'error', 'non_field_errors'].includes(key)) continue
      const first = Array.isArray(value) ? value[0] : value
      if (typeof first === 'string') fields[key] = first
    }
    return { message, fields }
  }
  return { fields }
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Add auth headers here when the backend is ready (one place for every call).
function defaultHeaders(method: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (method !== 'GET') {
    const csrf = getCookie('csrftoken')
    if (csrf) headers['X-CSRFToken'] = csrf
  }
  return headers
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  redirectOnUnauthorized?: boolean
}

export async function request<T>(path: string, { method = 'GET', body, redirectOnUnauthorized = true }: Options = {}): Promise<T> {
  if (!API_URL) throw new ApiError('The API address is not set.', 0)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const headers = defaultHeaders(method)
  if (body && !isForm) headers['Content-Type'] = 'application/json'

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!res.ok) {
      let data: unknown = null
      try {
        data = await res.json()
      } catch {
        /* not JSON */
      }
      const { message, fields } = parseErrorBody(data)

      if (res.status === 401 && redirectOnUnauthorized && typeof window !== 'undefined') {
        window.location.replace(new URL(LOGIN_PATH, window.location.origin).toString())
      }
      throw new ApiError(message ?? fallbackFor(res.status), res.status, fields)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(fallbackFor(408), 408)
    }
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0)
  } finally {
    clearTimeout(timer)
  }
}

// For server pages: never throws. Returns { data } or { error }.
export type Loaded<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; status: number } }

export async function load<T>(promise: Promise<T>): Promise<Loaded<T>> {
  try {
    return { data: await promise, error: null }
  } catch (err) {
    if (err instanceof ApiError) return { data: null, error: { message: err.message, status: err.status } }
    return { data: null, error: { message: 'Something unexpected happened. Try again.', status: -1 } }
  }
}
