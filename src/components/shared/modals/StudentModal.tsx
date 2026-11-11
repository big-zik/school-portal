'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StudentForm } from '@/components/shared/forms/StudentForm'
import type { StudentProfile, ClassSummary } from '@/types'
import type { StudentProfileInput } from '@/lib/validators'

export interface StudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: StudentProfile | null
  classes: ClassSummary[]
  onSuccess: () => void
}

export function StudentModal({
  open,
  onOpenChange,
  student,
  classes = [],
  onSuccess,
}: StudentModalProps) {
  const [loading, setLoading] = React.useState(false)
  const isEditing = Boolean(student?.id)

  const handleSubmit = async (data: StudentProfileInput) => {
    setLoading(true)
    try {
      const url = isEditing && student?.id
        ? `/api/students/${student.id}`
        : '/api/students'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok || json.success === false) {
        throw new Error(json.error || json.message || 'Operation failed')
      }

      toast.success(
        isEditing
          ? 'Student updated successfully'
          : 'Student created successfully',
      )
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const defaultValues: Partial<StudentProfileInput> = student
    ? {
        fullName: student.fullName || '',
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth
          ? new Date(student.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: student.gender as any,
        bloodGroup: student.bloodGroup as any,
        religion: student.religion || '',
        nationality: student.nationality || '',
        address: student.address || '',
        city: student.city || '',
        state: student.state || '',
        country: student.country || '',
        admissionDate: student.admissionDate
          ? new Date(student.admissionDate).toISOString().split('T')[0]
          : '',
        admissionNumber: student.admissionNumber || '',
        currentClassId: student.currentClass?.id,
        currentSectionId: student.currentSection?.id,
      }
    : {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the student profile details below.'
              : 'Enter the details for registering a new student.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <StudentForm
            key={student?.id || 'new'}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={loading}
            classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
