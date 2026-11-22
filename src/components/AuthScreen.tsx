'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import styled, { keyframes } from 'styled-components'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiSend, FiUser, FiZap } from 'react-icons/fi'
import { logIn, signUp } from '@/lib/auth'
import { ApiError } from '@/lib/http'
import { theme as t } from '@/lib/theme'
import { useToast } from '@/components/toast'

const appear = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const Page = styled.main`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(300px, .86fr) minmax(440px, 1.14fr);
  background: ${t.color.white};
  @media (max-width: 760px) { display: block; }
`
const BrandSide = styled.aside`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(28px, 5vw, 64px);
  color: ${t.color.white};
  background: #0a0a0a;
  &::before, &::after { content: ''; position: absolute; z-index: -1; border-radius: 50%; pointer-events: none; }
  &::before { width: 440px; height: 440px; right: -190px; bottom: -155px; border: 1px solid #ffffff1b; box-shadow: 0 0 0 48px #ffffff08, 0 0 0 96px #ffffff05; }
  &::after { width: 250px; height: 250px; right: -96px; bottom: -60px; background: radial-gradient(circle, #11111125, transparent 68%); }
  @media (max-width: 760px) { display: none; }
`
const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 11px;
  width: fit-content;
  color: inherit;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -.6px;
`
const Mark = styled.span`
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid #ffffff24;
  border-radius: 11px;
  color: #fff;
  background: #ffffff12;
  svg { width: 18px; height: 18px; stroke-width: 2.2; }
`
const BrandCopy = styled.div`
  max-width: 430px;
  margin: auto 0;
  padding: 68px 0;
  animation: ${appear} .32s cubic-bezier(.2, .8, .2, 1) both;
  @media (max-width: 760px) { display: none; }
`
const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 22px;
  color: #c4c4c4;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  svg { color: #a3a3a3; }
`
const BrandTitle = styled.h1`
  max-width: 420px;
  margin: 0;
  font-size: clamp(35px, 4vw, 52px);
  line-height: 1.08;
  letter-spacing: -2.4px;
  font-weight: 600;
`
const BrandDescription = styled.p`
  max-width: 370px;
  margin: 20px 0 0;
  color: #a3a3a3;
  font-size: 15px;
  line-height: 1.75;
`
const BrandFoot = styled.p`
  margin: 0;
  color: #737373;
  font-size: 12px;
  @media (max-width: 760px) { display: none; }
`
const FormSide = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 52px 34px;
  background: #ffffff;
  @media (max-width: 760px) { min-height: 100dvh; padding: 34px 20px 44px; align-items: flex-start; }
`
const FormWrap = styled.div`
  width: 100%;
  max-width: 420px;
  animation: ${appear} .32s cubic-bezier(.2, .8, .2, 1) both;
`
const Mode = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 18px;
  padding: 6px 10px;
  border: 1px solid ${t.color.line};
  border-radius: 999px;
  color: ${t.color.muted};
  background: ${t.color.white};
  font-size: 11px;
  font-weight: 600;
  svg { color: #737373; }
`
const Title = styled.h2`
  margin: 0 0 26px;
  color: ${t.color.ink};
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: -1.1px;
  font-weight: 650;
  @media (max-width: ${t.mobile}) { font-size: 27px; }
`
const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #404040;
  font-size: 12px;
  font-weight: 600;
  svg { width: 14px; height: 14px; color: #737373; stroke-width: 1.8; }
  span { color: #8791a2; font-weight: 400; }
`
const Form = styled.form`
  display: grid;
  gap: 18px;
`
const Field = styled.div`
  display: grid;
  gap: 7px;
  input {
    width: 100%;
    height: 47px;
    padding: 0 13px;
    border: 1px solid #dedede;
    border-radius: 9px;
    outline: none;
    color: ${t.color.ink};
    background: ${t.color.white};
    font: 400 13px ${t.font.body};
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  }
  input::placeholder { color: #a3a3a3; }
  input:hover { border-color: #d4d4d4; }
  input:focus { border-color: #737373; box-shadow: 0 0 0 3px #11111115; }
`
const PasswordWrap = styled.div`
  position: relative;
  input { padding-right: 48px; }
  button {
    position: absolute;
    top: 0;
    right: 0;
    display: grid;
    width: 46px;
    height: 47px;
    place-items: center;
    border: 0;
    color: #737373;
    background: transparent;
    cursor: pointer;
  }
  svg { width: 16px; height: 16px; }
`
const Submit = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 48px;
  margin-top: 4px;
  border: 0;
  border-radius: 9px;
  color: white;
  background: #111111;
  font: 600 13px ${t.font.body};
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
  &:hover { transform: translateY(-1px); background: #262626; box-shadow: 0 7px 18px #1111112a; }
  &:active { transform: translateY(0); }
  &:disabled { opacity: .65; cursor: wait; transform: none; }
  svg { width: 16px; height: 16px; }
`
const Switch = styled.p`
  margin: 22px 0 0;
  color: ${t.color.muted};
  text-align: center;
  font-size: 12px;
  a { color: #171717; font-weight: 650; }
  a:hover { text-decoration: underline; }
`

type AuthScreenProps = { mode: 'signup' | 'login' }

export default function AuthScreen({ mode }: AuthScreenProps) {
  const isSignup = mode === 'signup'
  const router = useRouter()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const username = String(form.get('username') ?? '').trim()
    const password = String(form.get('password') ?? '')

    if (isSignup) {
      const email = String(form.get('email') ?? '').trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('Check your email', 'Enter a valid email address to continue.')
        return
      }
    }
    if (username.length < 3) {
      toast.error('Username is too short', 'Use at least 3 characters.')
      return
    }
    if (password.length < 8) {
      toast.error('Password is too short', 'Use at least 8 characters.')
      return
    }

    setBusy(true)

    try {
      if (isSignup) {
        await signUp({
          username,
          password,
          email: String(form.get('email') ?? '').trim(),
          telegramUsername: String(form.get('telegramUsername') ?? '').trim().replace(/^@/, '') || undefined,
        })
        toast.success('Account created', 'You can now sign in with your username and password.')
        router.push('/login')
      } else {
        await logIn({ username, password })
        toast.success('Signed in', 'Welcome back to your Noutch workspace.')
        router.push('/overview')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldMessage = Object.values(err.fieldErrors)[0]
        toast.error(isSignup ? 'Could not create account' : 'Could not sign in', fieldMessage ?? err.message)
      } else {
        toast.error('Request failed', 'We could not complete that request. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <BrandSide>
        <Brand href="/login" aria-label="Noutch home"><Mark><FiZap /></Mark>Noutch</Brand>
        <BrandCopy>
          <Eyebrow><FiZap size={14} /> Noutch messaging</Eyebrow>
          <BrandTitle>Global SMS Gateway &amp; A2P Messaging</BrandTitle>
          <BrandDescription>Reach customers across regions with business messaging, flexible routing, and clear delivery visibility all managed from one platform.</BrandDescription>
        </BrandCopy>
        <BrandFoot>© Noutch</BrandFoot>
      </BrandSide>

      <FormSide>
        <FormWrap>
          <Mode><FiLock size={13} /> Noutch account</Mode>
          <Title>{isSignup ? 'Create your account' : 'Welcome back'}</Title>

          <Form onSubmit={submit} noValidate>
            {isSignup && (
              <Field>
                <Label htmlFor="email"><FiMail aria-hidden="true" />Email address</Label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
              </Field>
            )}
            <Field>
              <Label htmlFor="username"><FiUser aria-hidden="true" />Username</Label>
              <input id="username" name="username" autoComplete="username" placeholder="Your username" />
            </Field>
            <Field>
              <Label htmlFor="password"><FiLock aria-hidden="true" />Password</Label>
              <PasswordWrap>
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'Create a password' : 'Your password'} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
              </PasswordWrap>
            </Field>
            {isSignup && (
              <Field>
                <Label htmlFor="telegramUsername"><FiSend aria-hidden="true" />Telegram username <span>· Optional</span></Label>
                <input id="telegramUsername" name="telegramUsername" autoComplete="off" placeholder="@username" />
              </Field>
            )}

            <Submit type="submit" disabled={busy}>{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'} <FiArrowRight /></Submit>
          </Form>

          <Switch>{isSignup ? 'Already have an account? ' : 'New to Noutch? '}<Link href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Create account'}</Link></Switch>
        </FormWrap>
      </FormSide>
    </Page>
  )
}
