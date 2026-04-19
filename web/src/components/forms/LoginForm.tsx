'use client'

import { useState } from 'react'
import { useLogin } from '@shared'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LabeledInput } from '@/components/ui/labeled-input'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  const handlePrefill = () => {
    setEmail('test@example.com')
    setPassword('password123')
  }

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to sign in to your account
        </CardDescription>
        {isDev && (
          <div className="flex justify-center pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePrefill} className="text-xs">
              🧪 Prefill Form (Dev Only)
            </Button>
          </div>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <LabeledInput
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <LabeledInput
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>Invalid email or password</AlertDescription>
            </Alert>
          )}
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </CardContent>
      </form>
    </Card>
  )
}
