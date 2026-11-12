import { PrismaClient, RoleName, Gender, StudentStatus, AttendanceStatus, SubmissionStatus, ExaminationType, InvoiceStatus, PaymentMethod, PaymentStatus, LoanStatus, EventType, BloodGroup } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive school portal seeding...')

  // 1. Password hash for demo users
  const defaultPasswordHash = await hash('Password@123', 12)

  // 2. Seed Roles
  const rolesList: { name: RoleName; description: string }[] = [
    { name: RoleName.SUPER_ADMIN, description: 'Super Administrator with complete system access' },
    { name: RoleName.ADMIN, description: 'School Administrator managing school operations' },
    { name: RoleName.TEACHER, description: 'Teaching staff managing classes, grades, and attendance' },
    { name: RoleName.STUDENT, description: 'Enrolled student' },
    { name: RoleName.PARENT, description: 'Parent or Guardian' },
    { name: RoleName.ACCOUNTANT, description: 'Finance and bursary officer' },
    { name: RoleName.LIBRARIAN, description: 'Library manager' },
    { name: RoleName.HOSTEL_STAFF, description: 'Boarding house warden' },
    { name: RoleName.TRANSPORT_STAFF, description: 'Fleet and transport manager' },
    { name: RoleName.SUPPORT_STAFF, description: 'Administrative and IT support' },
  ]

  const roleMap = new Map<RoleName, string>()
  for (const r of rolesList) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: r.description },
    })
    roleMap.set(r.name, role.id)
  }
  console.log('✅ Roles initialized')

  // 3. Seed School
  const school = await prisma.school.upsert({
    where: { id: 'school-main-001' },
    update: {
      name: 'CHOSEN GENERATION SCHOOL',
    },
    create: {
      id: 'school-main-001',
      name: 'CHOSEN GENERATION SCHOOL',
      address: '42 Academic Way, Victoria Island',
      phone: '+234 1 234 5678',
      email: 'info@chosengenerationschool.edu',
      website: 'https://chosengenerationschool.edu',
      timezone: 'Africa/Lagos',
      currency: 'NGN',
      country: 'Nigeria',
      primaryColor: '#1e3a8a',
      secondaryColor: '#f59e0b',
    },
  })
  console.log('✅ School profile created:', school.name)

  // 4. Academic Years & Terms
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'ay-2024-2025' },
    update: {},
    create: {
      id: 'ay-2024-2025',
      schoolId: school.id,
      name: '2024/2025 Academic Session',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-07-20'),
      isCurrent: true,
    },
  })

  const term1 = await prisma.term.upsert({
    where: { id: 'term-1-2024' },
    update: {},
    create: {
      id: 'term-1-2024',
      academicYearId: academicYear.id,
      name: 'First Term (Fall)',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-18'),
      isCurrent: false,
    },
  })

  const term2 = await prisma.term.upsert({
    where: { id: 'term-2-2025' },
    update: {},
    create: {
      id: 'term-2-2025',
      academicYearId: academicYear.id,
      name: 'Second Term (Spring)',
      startDate: new Date('2025-01-08'),
      endDate: new Date('2025-04-12'),
      isCurrent: true,
    },
  })

  const term3 = await prisma.term.upsert({
    where: { id: 'term-3-2025' },
    update: {},
    create: {
      id: 'term-3-2025',
      academicYearId: academicYear.id,
      name: 'Third Term (Summer)',
      startDate: new Date('2025-04-28'),
      endDate: new Date('2025-07-20'),
      isCurrent: false,
    },
  })
  console.log('✅ Academic Years and Terms seeded')

  // Helper to create user with roles
  async function createUser(email: string, name: string, phone: string, roles: RoleName[]) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: defaultPasswordHash, isActive: true },
      create: {
        email,
        name,
        phone,
        password: defaultPasswordHash,
        emailVerified: true,
        isActive: true,
      },
    })

    for (const rName of roles) {
      const roleId = roleMap.get(rName)!
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      })
    }

    return user
  }

  // 5. Seed Core Admins
  const superAdminUser = await createUser(
    'superadmin@school.com',
    'Dr. Elizabeth Vance',
    '+234 801 000 0001',
    [RoleName.SUPER_ADMIN, RoleName.ADMIN]
  )

  const adminUser = await createUser(
    'admin@school.com',
    'Marcus Adeyemi',
    '+234 801 000 0002',
    [RoleName.ADMIN]
  )

  const accountantUser = await createUser(
    'accountant@school.com',
    'Beatrice Okonjo',
    '+234 801 000 0003',
    [RoleName.ACCOUNTANT]
  )

  const librarianUser = await createUser(
    'librarian@school.com',
    'Samuel Danladi',
    '+234 801 000 0004',
    [RoleName.LIBRARIAN]
  )

  console.log('✅ Admin and Staff accounts seeded')

  // 6. Departments
  const deptScience = await prisma.department.create({
    data: { schoolId: school.id, name: 'Sciences' },
  }).catch(() => prisma.department.findFirst({ where: { name: 'Sciences' } }))

  const deptArts = await prisma.department.create({
    data: { schoolId: school.id, name: 'Arts & Humanities' },
  }).catch(() => prisma.department.findFirst({ where: { name: 'Arts & Humanities' } }))

  // 7. Seed Teachers
  const teacherUser1 = await createUser(
    'teacher.smith@school.com',
    'Dr. Robert Smith',
    '+234 802 111 0001',
    [RoleName.TEACHER]
  )

  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacherUser1.id },
    update: {},
    create: {
      userId: teacherUser1.id,
      schoolId: school.id,
      employeeId: 'TCH2024001',
      qualification: 'Ph.D. in Mathematics Education',
      specialization: 'Advanced Calculus & Statistics',
      gender: Gender.MALE,
      departmentId: deptScience?.id,
    },
  })

  const teacherUser2 = await createUser(
    'teacher.adebayo@school.com',
    'Mrs. Folashade Adebayo',
    '+234 802 111 0002',
    [RoleName.TEACHER]
  )

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacherUser2.id },
    update: {},
    create: {
      userId: teacherUser2.id,
      schoolId: school.id,
      employeeId: 'TCH2024002',
      qualification: 'M.Sc. in Organic Chemistry',
      specialization: 'Physical & Organic Chemistry',
      gender: Gender.FEMALE,
      departmentId: deptScience?.id,
    },
  })

  const teacherUser3 = await createUser(
    'teacher.clark@school.com',
    'Mr. Andrew Clark',
    '+234 802 111 0003',
    [RoleName.TEACHER]
  )

  const teacher3 = await prisma.teacher.upsert({
    where: { userId: teacherUser3.id },
    update: {},
    create: {
      userId: teacherUser3.id,
      schoolId: school.id,
      employeeId: 'TCH2024003',
      qualification: 'M.A. English Literature',
      specialization: 'World Literature & Creative Writing',
      gender: Gender.MALE,
      departmentId: deptArts?.id,
    },
  })
  console.log('✅ Teachers seeded')

  // 8. Classes and Sections (Pre-School, Pre-Nursery, Nursery 1-2, Basic 1-5, JSS 1-2)
  const schoolClassesData = [
    { id: 'class-preschool', name: 'Pre-School', level: 0, desc: 'Early Childhood Development & Playgroup', cap: 25 },
    { id: 'class-prenursery', name: 'Pre-Nursery', level: 1, desc: 'Pre-Nursery Foundational Learning', cap: 25 },
    { id: 'class-nursery1', name: 'Nursery 1', level: 2, desc: 'Nursery 1 Early Literacy & Numeracy', cap: 30 },
    { id: 'class-nursery2', name: 'Nursery 2', level: 3, desc: 'Nursery 2 Kindergarten Transition', cap: 30 },
    { id: 'class-basic1', name: 'Basic 1', level: 4, desc: 'Primary 1 / Basic One Foundation', cap: 35 },
    { id: 'class-basic2', name: 'Basic 2', level: 5, desc: 'Primary 2 / Basic Two Elementary', cap: 35 },
    { id: 'class-basic3', name: 'Basic 3', level: 6, desc: 'Primary 3 / Basic Three Elementary', cap: 35 },
    { id: 'class-basic4', name: 'Basic 4', level: 7, desc: 'Primary 4 / Basic Four Intermediate', cap: 35 },
    { id: 'class-basic5', name: 'Basic 5', level: 8, desc: 'Primary 5 / Basic Five Intermediate', cap: 35 },
    { id: 'class-jss1', name: 'JSS 1', level: 9, desc: 'Junior Secondary School 1', cap: 40 },
    { id: 'class-jss2', name: 'JSS 2', level: 10, desc: 'Junior Secondary School 2', cap: 40 },
  ]

  for (const c of schoolClassesData) {
    const cls = await prisma.class.upsert({
      where: { id: c.id },
      update: { name: c.name, level: c.level, capacity: c.cap, description: c.desc },
      create: {
        id: c.id,
        schoolId: school.id,
        name: c.name,
        level: c.level,
        description: c.desc,
        capacity: c.cap,
      },
    })

    await prisma.section.upsert({
      where: { id: `sec-${c.id}-a` },
      update: {},
      create: {
        id: `sec-${c.id}-a`,
        classId: cls.id,
        name: 'Section A',
        roomNumber: `Room ${100 + c.level}`,
        capacity: c.cap,
      },
    })
  }

  const class10 = await prisma.class.upsert({
    where: { id: 'class-jss1' },
    update: {},
    create: {
      id: 'class-jss1',
      schoolId: school.id,
      name: 'JSS 1',
      level: 9,
      description: 'Junior Secondary',
      capacity: 40,
    },
  })

  const section10A = await prisma.section.upsert({
    where: { id: 'sec-class-jss1-a' },
    update: {},
    create: {
      id: 'sec-class-jss1-a',
      classId: class10.id,
      name: 'Section A',
      roomNumber: 'Room 201',
      capacity: 40,
    },
  })
  console.log('✅ 11 School Classes and Sections seeded')

  // 9. Subjects
  const subMath = await prisma.subject.upsert({
    where: { id: 'sub-math-101' },
    update: {},
    create: {
      id: 'sub-math-101',
      schoolId: school.id,
      name: 'Pure Mathematics',
      code: 'MTH101',
      creditHours: 4,
    },
  })

  const subChem = await prisma.subject.upsert({
    where: { id: 'sub-chem-101' },
    update: {},
    create: {
      id: 'sub-chem-101',
      schoolId: school.id,
      name: 'General Chemistry',
      code: 'CHM101',
      creditHours: 4,
    },
  })

  const subEng = await prisma.subject.upsert({
    where: { id: 'sub-eng-101' },
    update: {},
    create: {
      id: 'sub-eng-101',
      schoolId: school.id,
      name: 'English & Composition',
      code: 'ENG101',
      creditHours: 3,
    },
  })

  // Assign teachers to class subjects
  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class10.id, subjectId: subMath.id } },
    update: { teacherId: teacher1.id },
    create: { classId: class10.id, subjectId: subMath.id, teacherId: teacher1.id },
  })

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class10.id, subjectId: subChem.id } },
    update: { teacherId: teacher2.id },
    create: { classId: class10.id, subjectId: subChem.id, teacherId: teacher2.id },
  })

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class10.id, subjectId: subEng.id } },
    update: { teacherId: teacher3.id },
    create: { classId: class10.id, subjectId: subEng.id, teacherId: teacher3.id },
  })
  console.log('✅ Subjects and Teacher assignments seeded')

  // 10. Seed Parents & Students
  const parentUser1 = await createUser(
    'parent.johnson@school.com',
    'Chief Michael Johnson',
    '+234 803 222 0001',
    [RoleName.PARENT]
  )

  const guardian1 = await prisma.guardian.upsert({
    where: { userId: parentUser1.id },
    update: {},
    create: {
      userId: parentUser1.id,
      relationship: 'FATHER',
      occupation: 'Senior Geologist, Shell Nigeria',
      officeAddress: 'Marina, Lagos Island',
    },
  })

  // Student 1
  const studentUser1 = await createUser(
    'student.daniel@school.com',
    'Daniel Johnson',
    '+234 803 333 0001',
    [RoleName.STUDENT]
  )

  const student1 = await prisma.student.upsert({
    where: { userId: studentUser1.id },
    update: {},
    create: {
      userId: studentUser1.id,
      schoolId: school.id,
      studentId: 'STU2024001',
      dateOfBirth: new Date('2009-04-14'),
      gender: Gender.MALE,
      bloodGroup: BloodGroup.O_POSITIVE,
      nationality: 'Nigerian',
      address: '15 Admiralty Way, Lekki Phase 1, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      currentClassId: class10.id,
      currentSectionId: section10A.id,
      currentAcademicYearId: academicYear.id,
      currentTermId: term2.id,
      status: StudentStatus.ACTIVE,
    },
  })

  // Link Guardian to Student
  await prisma.studentGuardian.upsert({
    where: { studentId_guardianId: { studentId: student1.id, guardianId: guardian1.id } },
    update: {},
    create: { studentId: student1.id, guardianId: guardian1.id, isPrimary: true },
  })

  // Student 2
  const studentUser2 = await createUser(
    'student.amara@school.com',
    'Amara Okafor',
    '+234 803 333 0002',
    [RoleName.STUDENT]
  )

  const student2 = await prisma.student.upsert({
    where: { userId: studentUser2.id },
    update: {},
    create: {
      userId: studentUser2.id,
      schoolId: school.id,
      studentId: 'STU2024002',
      dateOfBirth: new Date('2009-08-22'),
      gender: Gender.FEMALE,
      bloodGroup: BloodGroup.A_POSITIVE,
      nationality: 'Nigerian',
      address: '8 Bishop Oluwole St, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      currentClassId: class10.id,
      currentSectionId: section10A.id,
      currentAcademicYearId: academicYear.id,
      currentTermId: term2.id,
      status: StudentStatus.ACTIVE,
    },
  })
  console.log('✅ Students and Parents seeded')

  // 11. Attendance records
  const sampleDates = [
    new Date('2025-02-10'),
    new Date('2025-02-11'),
    new Date('2025-02-12'),
    new Date('2025-02-13'),
    new Date('2025-02-14'),
  ]

  for (const date of sampleDates) {
    await prisma.attendance.upsert({
      where: {
        studentId_classId_subjectId_date: {
          studentId: student1.id,
          classId: class10.id,
          subjectId: subMath.id,
          date,
        },
      },
      update: {},
      create: {
        studentId: student1.id,
        classId: class10.id,
        subjectId: subMath.id,
        date,
        status: AttendanceStatus.PRESENT,
        markedById: teacherUser1.id,
        termId: term2.id,
        academicYearId: academicYear.id,
      },
    })
  }

  // Record an excused absence for Amara
  await prisma.attendance.upsert({
    where: {
      studentId_classId_subjectId_date: {
        studentId: student2.id,
        classId: class10.id,
        subjectId: subMath.id,
        date: sampleDates[4],
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      classId: class10.id,
      subjectId: subMath.id,
      date: sampleDates[4],
      status: AttendanceStatus.EXCUSED,
      remarks: 'Medical clinic appointment with doctor note',
      markedById: teacherUser1.id,
      termId: term2.id,
      academicYearId: academicYear.id,
    },
  })
  console.log('✅ Attendance records seeded')

  // 12. Assignments & Submissions & Grades
  const assignment1 = await prisma.assignment.create({
    data: {
      teacherId: teacher1.id,
      classId: class10.id,
      subjectId: subMath.id,
      termId: term2.id,
      academicYearId: academicYear.id,
      title: 'Problem Set 4: Quadratic Equations & Graphing',
      description: 'Solve exercises 1 to 25 from Chapter 4. Graph exercises 18 and 22 on coordinate paper.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalMarks: 50,
      allowLateSubmission: true,
      latePenalty: 5,
      isPublished: true,
    },
  }).catch(() => null)

  if (assignment1) {
    const submission1 = await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: student1.id,
        submittedAt: new Date(),
        remarks: 'All 25 problems completed. Coordinate plots attached.',
        status: SubmissionStatus.GRADED,
      },
    })

    await prisma.grade.create({
      data: {
        submissionId: submission1.id,
        studentId: student1.id,
        assignmentId: assignment1.id,
        marksObtained: 46.5,
        percentage: 93,
        letterGrade: 'A',
        feedback: 'Superb work on the vertex and discriminant proofs, Daniel. Keep it up!',
        gradedById: teacher1.id,
        gradedAt: new Date(),
      },
    })
  }
  console.log('✅ Assignments and Grades seeded')

  // 13. Fees & Invoices
  const feeTuition = await prisma.feeCategory.create({
    data: { schoolId: school.id, name: 'Tuition & Academic Facilities' },
  }).catch(() => prisma.feeCategory.findFirst({ where: { name: 'Tuition & Academic Facilities' } }))

  const feeICT = await prisma.feeCategory.create({
    data: { schoolId: school.id, name: 'ICT & STEM Laboratory' },
  }).catch(() => prisma.feeCategory.findFirst({ where: { name: 'ICT & STEM Laboratory' } }))

  if (feeTuition && feeICT) {
    const invoice1 = await prisma.invoice.create({
      data: {
        studentId: student1.id,
        termId: term2.id,
        academicYearId: academicYear.id,
        invoiceNumber: 'INV-2025-00142',
        totalAmount: 285000,
        discountAmount: 0,
        paidAmount: 285000,
        balanceAmount: 0,
        status: InvoiceStatus.PAID,
        dueDate: new Date('2025-01-31'),
        invoiceItems: {
          create: [
            { feeCategoryId: feeTuition.id, description: 'Term 2 Tuition - Senior Secondary', amount: 250000 },
            { feeCategoryId: feeICT.id, description: 'Robotics & STEM Lab Resource Pack', amount: 35000 },
          ],
        },
      },
    })

    const payment1 = await prisma.payment.create({
      data: {
        invoiceId: invoice1.id,
        studentId: student1.id,
        amount: 285000,
        paymentMethod: PaymentMethod.ONLINE,
        paymentDate: new Date('2025-01-20'),
        referenceNumber: 'PSK_REF_991823719',
        gatewayRef: 'paystack_trn_00192',
        status: PaymentStatus.COMPLETED,
        paidById: parentUser1.id,
      },
    })

    await prisma.receipt.create({
      data: {
        paymentId: payment1.id,
        receiptNumber: 'REC-2025-00089',
      },
    })
  }
  console.log('✅ Fees and Invoices seeded')

  // 14. Library Books
  await prisma.book.createMany({
    data: [
      {
        schoolId: school.id,
        title: 'New General Mathematics for Senior Secondary Schools 1',
        author: 'M.F. Macrae et al.',
        isbn: '978-978-08-0382-7',
        category: 'Mathematics',
        totalCopies: 40,
        availableCopies: 38,
        location: 'Shelf M-02',
      },
      {
        schoolId: school.id,
        title: 'Comprehensive Certificate Chemistry',
        author: 'G.N.C. Ohia & F.A. Adebayo',
        isbn: '978-978-12-8901-2',
        category: 'Sciences',
        totalCopies: 25,
        availableCopies: 22,
        location: 'Shelf S-05',
      },
      {
        schoolId: school.id,
        title: 'Things Fall Apart',
        author: 'Chinua Achebe',
        isbn: '978-0385474542',
        category: 'Literature',
        totalCopies: 50,
        availableCopies: 45,
        location: 'Shelf L-01',
      },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Library books catalog seeded')

  // 15. Announcements
  await prisma.announcement.create({
    data: {
      authorId: superAdminUser.id,
      title: 'Mid-Term Break Schedule & Academic Excursion Notice',
      content: 'Please be informed that the mid-term break commences on Friday 28th February. The Grade 10 Science cohort will depart for the National Space Research & Development Agency on Thursday morning.',
      isPublished: true,
      isPinned: true,
      publishedAt: new Date(),
    },
  })

  // 16. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: superAdminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      module: 'SYSTEM',
      entityType: 'School',
      entityId: school.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Seed-Script',
      createdAt: new Date(),
    },
  })

  console.log('\n======================================================')
  console.log('🎉 School Portal Seed Completed Successfully!')
  console.log('======================================================')
  console.log('Demo Credentials (Password for all accounts: Password@123):')
  console.log('  👑 Super Admin: superadmin@school.com')
  console.log('  🏫 Administrator: admin@school.com')
  console.log('  👨‍🏫 Teacher: teacher.smith@school.com')
  console.log('  🎓 Student: student.daniel@school.com')
  console.log('  👨‍👧 Parent: parent.johnson@school.com')
  console.log('  💰 Accountant: accountant@school.com')
  console.log('  📚 Librarian: librarian@school.com')
  console.log('======================================================\n')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
