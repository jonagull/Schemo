import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

interface LabeledInputProps extends React.ComponentProps<typeof Input> {
  id: string
  label: string
  error?: string
}

export function LabeledInput({ label, id, error, ...props }: LabeledInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  )
}
