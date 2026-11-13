import {
  studentProfileSchema,
  teacherProfileSchema,
  subjectSchema,
  timetableSchema,
  assignmentSchema,
  submissionSchema,
  gradeSchema,
  announcementSchema,
  eventSchema,
  feeStructureSchema,
  admissionApplicationSchema,
  bookSchema,
} from '@/lib/validators'

const UUID = '3f2b8c1e-5a4d-4b7e-9c1a-2d3e4f5a6b7c'
const UUID2 = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'

describe('studentProfileSchema', () => {
  const valid = { fullName: 'Chidi Okafor', email: 'Chidi@School.com' }

  it('accepts the minimal valid profile and lowercases the email', () => {
    const res = studentProfileSchema.safeParse(valid)
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.email).toBe('chidi@school.com')
  })

  it('rejects a one-character full name', () => {
    expect(studentProfileSchema.safeParse({ ...valid, fullName: 'C' }).success).toBe(false)
  })

  it('rejects an invalid gender value', () => {
    expect(studentProfileSchema.safeParse({ ...valid, gender: 'UNKNOWN' }).success).toBe(false)
  })

  it.each(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'])(
    'accepts blood group %s',
    (bloodGroup) => {
      expect(studentProfileSchema.safeParse({ ...valid, bloodGroup }).success).toBe(true)
    },
  )

  it('rejects an invalid blood group', () => {
    expect(studentProfileSchema.safeParse({ ...valid, bloodGroup: 'C+' }).success).toBe(false)
  })

  it('rejects an unparseable date of birth', () => {
    expect(studentProfileSchema.safeParse({ ...valid, dateOfBirth: 'not-a-date' }).success).toBe(false)
  })

  it('accepts an ISO date of birth', () => {
    expect(studentProfileSchema.safeParse({ ...valid, dateOfBirth: '2012-05-14' }).success).toBe(true)
  })

  it('requires every emergency contact field when a contact is supplied', () => {
    const res = studentProfileSchema.safeParse({
      ...valid,
      emergencyContact: { name: 'Mum', phone: '', relationship: 'Mother' },
    })
    expect(res.success).toBe(false)
  })

  it('rejects a non-UUID class id', () => {
    expect(studentProfileSchema.safeParse({ ...valid, currentClassId: 'JSS1' }).success).toBe(false)
  })

  it('accepts a UUID class id', () => {
    expect(studentProfileSchema.safeParse({ ...valid, currentClassId: UUID }).success).toBe(true)
  })
})

describe('teacherProfileSchema', () => {
  const valid = { fullName: 'Mrs Bello', email: 'bello@school.com', employmentType: 'FULL_TIME' }

  it('accepts a valid teacher profile', () => {
    expect(teacherProfileSchema.safeParse(valid).success).toBe(true)
  })

  it('requires an employment type', () => {
    const { employmentType: _omit, ...rest } = valid
    expect(teacherProfileSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects an unknown employment type', () => {
    expect(teacherProfileSchema.safeParse({ ...valid, employmentType: 'FREELANCE' }).success).toBe(false)
  })

  it('rejects non-UUID subject ids', () => {
    expect(teacherProfileSchema.safeParse({ ...valid, subjectIds: ['maths'] }).success).toBe(false)
  })

  it('accepts UUID subject and class id lists', () => {
    expect(
      teacherProfileSchema.safeParse({ ...valid, subjectIds: [UUID], classIds: [UUID, UUID2] }).success,
    ).toBe(true)
  })
})

describe('subjectSchema', () => {
  const valid = { name: 'Mathematics', code: 'mth101', classIds: [UUID] }

  it('uppercases the subject code and defaults isElective to false', () => {
    const res = subjectSchema.safeParse(valid)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.code).toBe('MTH101')
      expect(res.data.isElective).toBe(false)
    }
  })

  it('requires at least one class', () => {
    expect(subjectSchema.safeParse({ ...valid, classIds: [] }).success).toBe(false)
  })

  it('rejects a one-character subject code', () => {
    expect(subjectSchema.safeParse({ ...valid, code: 'M' }).success).toBe(false)
  })

  it('rejects credit hours above 10', () => {
    expect(subjectSchema.safeParse({ ...valid, creditHours: 11 }).success).toBe(false)
  })
})

describe('timetableSchema', () => {
  const valid = {
    classId: UUID,
    subjectId: UUID,
    teacherId: UUID,
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '08:40',
  }

  it('accepts a valid timetable slot', () => {
    expect(timetableSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an end time equal to the start time', () => {
    expect(timetableSchema.safeParse({ ...valid, endTime: '08:00' }).success).toBe(false)
  })

  it('rejects an end time before the start time with an endTime error', () => {
    const res = timetableSchema.safeParse({ ...valid, startTime: '10:00', endTime: '09:00' })
    expect(res.success).toBe(false)
    if (!res.success) expect(res.error.issues[0].path).toContain('endTime')
  })

  it.each(['8:00', '24:00', '12:60', 'noon'])('rejects malformed time %s', (startTime) => {
    expect(timetableSchema.safeParse({ ...valid, startTime }).success).toBe(false)
  })

  it('rejects an unknown weekday', () => {
    expect(timetableSchema.safeParse({ ...valid, dayOfWeek: 'SUNDAY' }).success).toBe(false)
  })
})

describe('assignmentSchema', () => {
  const valid = {
    title: 'Algebra Homework',
    subjectId: UUID,
    classId: UUID,
    dueDate: '2026-12-01',
    totalMarks: 20,
  }

  it('accepts a valid assignment and applies boolean defaults', () => {
    const res = assignmentSchema.safeParse(valid)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.allowLateSubmission).toBe(false)
      expect(res.data.isPublished).toBe(false)
    }
  })

  it('rejects a title shorter than 3 characters', () => {
    expect(assignmentSchema.safeParse({ ...valid, title: 'ab' }).success).toBe(false)
  })

  it('rejects zero total marks', () => {
    expect(assignmentSchema.safeParse({ ...valid, totalMarks: 0 }).success).toBe(false)
  })

  it('rejects total marks above 1000', () => {
    expect(assignmentSchema.safeParse({ ...valid, totalMarks: 1001 }).success).toBe(false)
  })

  it('rejects fractional total marks', () => {
    expect(assignmentSchema.safeParse({ ...valid, totalMarks: 10.5 }).success).toBe(false)
  })

  it('rejects an invalid due date', () => {
    expect(assignmentSchema.safeParse({ ...valid, dueDate: 'tomorrow-ish' }).success).toBe(false)
  })

  it('rejects non-URL attachments', () => {
    expect(assignmentSchema.safeParse({ ...valid, attachmentUrls: ['not a url'] }).success).toBe(false)
  })
})

describe('submissionSchema', () => {
  it('accepts a valid submission', () => {
    expect(
      submissionSchema.safeParse({ assignmentId: UUID, fileUrls: ['https://files.example.com/a.pdf'] }).success,
    ).toBe(true)
  })

  it('rejects a non-UUID assignment id', () => {
    expect(submissionSchema.safeParse({ assignmentId: '123' }).success).toBe(false)
  })
})

describe('gradeSchema', () => {
  it('accepts zero marks', () => {
    expect(gradeSchema.safeParse({ submissionId: UUID, marksObtained: 0 }).success).toBe(true)
  })

  it('rejects negative marks', () => {
    expect(gradeSchema.safeParse({ submissionId: UUID, marksObtained: -1 }).success).toBe(false)
  })

  it('rejects marks supplied as a string', () => {
    expect(gradeSchema.safeParse({ submissionId: UUID, marksObtained: '15' }).success).toBe(false)
  })

  it('rejects feedback over 2000 characters', () => {
    expect(
      gradeSchema.safeParse({ submissionId: UUID, marksObtained: 5, feedback: 'x'.repeat(2001) }).success,
    ).toBe(false)
  })
})

describe('announcementSchema', () => {
  const valid = { title: 'Mid-term break', content: 'School closes on Friday for the break.' }

  it('accepts a valid announcement with defaults', () => {
    const res = announcementSchema.safeParse(valid)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.isPinned).toBe(false)
      expect(res.data.isPublished).toBe(false)
    }
  })

  it('rejects content shorter than 10 characters', () => {
    expect(announcementSchema.safeParse({ ...valid, content: 'short' }).success).toBe(false)
  })

  it('rejects an unknown target role', () => {
    expect(announcementSchema.safeParse({ ...valid, targetRoles: ['PRINCIPAL'] }).success).toBe(false)
  })

  it('accepts known target roles', () => {
    expect(announcementSchema.safeParse({ ...valid, targetRoles: ['PARENT', 'STUDENT'] }).success).toBe(true)
  })
})

describe('eventSchema', () => {
  const valid = {
    title: 'Inter-house Sports',
    startDate: '2026-12-05',
    endDate: '2026-12-06',
    type: 'SPORTS',
  }

  it('accepts a valid event', () => {
    expect(eventSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a single-day event where start equals end', () => {
    expect(eventSchema.safeParse({ ...valid, endDate: valid.startDate }).success).toBe(true)
  })

  it('rejects an end date before the start date', () => {
    const res = eventSchema.safeParse({ ...valid, endDate: '2026-12-01' })
    expect(res.success).toBe(false)
    if (!res.success) expect(res.error.issues[0].path).toContain('endDate')
  })

  it('rejects an unknown event type', () => {
    expect(eventSchema.safeParse({ ...valid, type: 'PARTY' }).success).toBe(false)
  })
})

describe('feeStructureSchema', () => {
  const valid = {
    feeCategoryId: UUID,
    classId: UUID,
    amount: 150000,
    dueDate: '2026-09-15',
  }

  it('accepts a valid fee structure and defaults isMandatory to true', () => {
    const res = feeStructureSchema.safeParse(valid)
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.isMandatory).toBe(true)
  })

  it('accepts a zero amount (waived fee)', () => {
    expect(feeStructureSchema.safeParse({ ...valid, amount: 0 }).success).toBe(true)
  })

  it('rejects a negative amount', () => {
    expect(feeStructureSchema.safeParse({ ...valid, amount: -500 }).success).toBe(false)
  })
})

describe('admissionApplicationSchema', () => {
  const valid = {
    applicantName: 'Tunde Bakare',
    dateOfBirth: '2014-03-02',
    gender: 'MALE',
    appliedClassId: UUID,
    parentName: 'Mr Bakare',
    parentEmail: 'PARENT@Example.com',
    parentPhone: '08012345678',
    address: '12 Allen Avenue, Ikeja',
  }

  it('accepts a valid application and lowercases the parent email', () => {
    const res = admissionApplicationSchema.safeParse(valid)
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.parentEmail).toBe('parent@example.com')
  })

  it('rejects a phone number under 10 digits', () => {
    expect(admissionApplicationSchema.safeParse({ ...valid, parentPhone: '0801234' }).success).toBe(false)
  })

  it('rejects a phone number over 20 characters', () => {
    expect(admissionApplicationSchema.safeParse({ ...valid, parentPhone: '1'.repeat(21) }).success).toBe(false)
  })

  it('rejects an address shorter than 5 characters', () => {
    expect(admissionApplicationSchema.safeParse({ ...valid, address: 'Lag' }).success).toBe(false)
  })

  it('rejects a missing applied class', () => {
    const { appliedClassId: _omit, ...rest } = valid
    expect(admissionApplicationSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects an invalid parent email', () => {
    expect(admissionApplicationSchema.safeParse({ ...valid, parentEmail: 'nope' }).success).toBe(false)
  })
})

describe('bookSchema ISBN handling', () => {
  const valid = { title: 'Things Fall Apart', author: 'Chinua Achebe', totalCopies: 3 }

  it('accepts a valid ISBN-13', () => {
    expect(bookSchema.safeParse({ ...valid, isbn: '9780385474542' }).success).toBe(true)
  })

  it('accepts a valid ISBN-10 ending in X', () => {
    expect(bookSchema.safeParse({ ...valid, isbn: '080442957X' }).success).toBe(true)
  })

  it('accepts an empty-string ISBN', () => {
    expect(bookSchema.safeParse({ ...valid, isbn: '' }).success).toBe(true)
  })

  it('rejects a malformed ISBN', () => {
    expect(bookSchema.safeParse({ ...valid, isbn: '12345' }).success).toBe(false)
  })

  it('rejects a published year in the far future', () => {
    expect(bookSchema.safeParse({ ...valid, publishedYear: new Date().getFullYear() + 5 }).success).toBe(false)
  })
})
