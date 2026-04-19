'use client'

import { z } from 'zod'
import { useState } from 'react'
import { useRegister } from '@shared'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LabeledInput } from '@/components/ui/labeled-input'
import { registerSchema } from './schemas/registerSchema'

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister()
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormData, boolean>>>({})

  const validateField = (field: keyof RegisterFormData, value: string) => {
    try {
      const partialSchema = registerSchema.pick({ [field]: true })
      partialSchema.parse({ [field]: value })
      setErrors(prev => ({ ...prev, [field]: undefined }))
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.issues[0]?.message }))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched on submit
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof RegisterFormData, boolean>
    )
    setTouched(allTouched)

    try {
      const validatedData = registerSchema.parse(formData)
      register({
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName || undefined,
        lastName: validatedData.lastName || undefined,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RegisterFormData, string>> = {}
        error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof RegisterFormData] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validateField(field, value)

      if (field === 'password' && touched.confirmPassword && formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: undefined }))
        }
      }
      if (field === 'confirmPassword' && touched.password) {
        if (value !== formData.password) {
          setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: undefined }))
        }
      }
    }
  }

  const handleBlur = (field: keyof RegisterFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field] || '')

    // Special handling for password confirmation on blur
    if (field === 'password' && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }))
      }
    }
    if (field === 'confirmPassword') {
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }))
      }
    }
  }

  const isFormValid =
    !Object.values(errors).some(error => error) && formData.email && formData.password && formData.confirmPassword

  const handlePrefill = () => {
    const prefillData: RegisterFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }
    setFormData(prefillData)
    // Mark all fields as touched to show validation
    const allTouched = Object.keys(prefillData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof RegisterFormData, boolean>
    )
    setTouched(allTouched)
    // Clear errors since we're prefilling valid data
    setErrors({})
  }

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
        <CardDescription className="text-center">Enter your information to create your account</CardDescription>
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
          <div className="grid grid-cols-2 gap-4">
            <LabeledInput
              label="First Name"
              id="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              error={touched.firstName ? errors.firstName : undefined}
            />
            <LabeledInput
              label="Last Name"
              id="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              error={touched.lastName ? errors.lastName : undefined}
            />
          </div>

          <LabeledInput
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            required
            autoComplete="email"
            error={touched.email ? errors.email : undefined}
          />

          <LabeledInput
            label="Password"
            id="password"
            type="password"
            value={formData.password}
            onChange={e => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            required
            autoComplete="new-password"
            error={touched.password ? errors.password : undefined}
          />

          <LabeledInput
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={e => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            required
            autoComplete="new-password"
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>Registration failed. Please try again.</AlertDescription>
            </Alert>
          )}
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={!isFormValid || isPending}>
              {isPending ? 'Creating account...' : 'Sign up'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </CardContent>
      </form>
    </Card>
  )
}
