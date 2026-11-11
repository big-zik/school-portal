'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentProfileSchema, type StudentProfileInput } from '@/lib/validators'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export interface StudentFormProps {
  defaultValues?: Partial<StudentProfileInput>
  onSubmit: (data: StudentProfileInput) => Promise<void>
  isLoading?: boolean
  classes: { id: string; name: string }[]
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
] as const

const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'UNKNOWN',
] as const

export function StudentForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  classes = [],
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: undefined,
      bloodGroup: undefined,
      currentClassId: undefined,
      admissionDate: '',
      address: '',
      ...defaultValues,
    },
  })

  const loading = isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="e.g. Adebayo Johnson"
          disabled={loading}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="student@school.edu"
            disabled={loading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            disabled={loading}
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Date of Birth & Admission Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            disabled={loading}
            {...register('dateOfBirth')}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="admissionDate">Admission Date</Label>
          <Input
            id="admissionDate"
            type="date"
            disabled={loading}
            {...register('admissionDate')}
          />
          {errors.admissionDate && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.admissionDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Gender & Blood Group */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Gender</Label>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(val) => field.onChange(val || undefined)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.gender.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Blood Group</Label>
          <Controller
            control={control}
            name="bloodGroup"
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={(val) => field.onChange(val || undefined)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.bloodGroup && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.bloodGroup.message}
            </p>
          )}
        </div>
      </div>

      {/* Current Class */}
      <div className="space-y-1">
        <Label>Current Class</Label>
        <Controller
          control={control}
          name="currentClassId"
          render={({ field }) => (
            <Select
              value={field.value || ''}
              onValueChange={(val) => field.onChange(val || undefined)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.currentClassId && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {errors.currentClassId.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1">
        <Label htmlFor="address">Residential Address</Label>
        <Textarea
          id="address"
          rows={3}
          placeholder="e.g. 14 Victoria Island Way, Lagos"
          disabled={loading}
          {...register('address')}
        />
        {errors.address && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Student'}
        </Button>
      </div>
    </form>
  )
}
