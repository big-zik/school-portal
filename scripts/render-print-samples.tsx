// Renders the four print templates with sample data: `npx tsx scripts/render-print-samples.tsx <outDir>`
import fs from 'fs'
import path from 'path'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportCardDocument } from '../src/lib/pdf/report-card'
import { FeeReceiptDocument } from '../src/lib/pdf/fee-receipt'
import { PayslipDocument } from '../src/lib/pdf/payslip'
import { StudentIdDocument } from '../src/lib/pdf/student-id'

const out = process.argv[2] ?? 'print-samples'
fs.mkdirSync(out, { recursive: true })
const subj = (name: string, ca: number, ex: number, g: string) => ({ name, caScore: ca, examScore: ex, totalScore: ca + ex, letterGrade: g, remark: '' })

async function main() {
  const jobs: Array<[string, React.ReactElement]> = [
    ['report-card', <ReportCardDocument key="a" data={{ schoolName: 'Chosen Generation School', schoolMotto: 'Born to Excel', schoolAddress: '', schoolPhone: '', schoolEmail: '', studentName: 'Chiamaka Okafor', studentId: 'CGS/2026/0142', className: 'JSS 2A', termName: 'First term', academicYear: '2026/2027', attendanceSummary: { present: 48, total: 50, percentage: 96 }, position: '3rd', outOf: 42, totalScore: 492, maxPossibleScore: 600, average: 82, grade: 'A', principalRemark: '', classTeacherRemark: 'Chiamaka works thoughtfully and contributes well in class.\nKeep practising algebra to strengthen your confidence.', qrCodeDataUrl: '', verificationUrl: 'https://verify.example/CGS-2026-0142', verificationCode: 'CGS-0142', subjects: [subj('Mathematics', 30, 42, 'B'), subj('English language', 34, 50, 'A'), subj('Basic science', 36, 52, 'A'), subj('Social studies', 32, 48, 'A'), subj('Business studies', 35, 51, 'A'), subj('Computer studies', 33, 49, 'A')] }} />],
    ['fee-receipt', <FeeReceiptDocument key="b" data={{ session: '2026/2027', receiptNo: 'REC-2026-0891', paidAtLabel: '13 November 2026  ·  10:15am WAT', amount: 45000, amountInWords: 'Forty-five thousand naira only', studentName: 'Chiamaka Okafor', className: 'JSS 2A', admissionNo: 'CGS/2026/0142', invoiceNo: 'INV-2026-0142', termName: 'First term', paidBy: 'Adaeze Okafor', method: 'Bank transfer', reference: 'CGS142131126', invoiceTotal: 145000, previouslyPaid: 100000, balance: 0 }} />],
    ['payslip', <PayslipDocument key="c" data={{ session: '2026/2027', payslipNo: 'PAY-2026-11038', periodLabel: 'November 2026', staffName: 'Mrs Yetunde Adebayo', staffId: 'CGS/STF/038', role: 'Mathematics Teacher', paymentDateLabel: '27 Nov 2026', bankLast4: '4821', earnings: [{ label: 'Basic salary', amount: 180000 }, { label: 'Housing allowance', amount: 40000 }, { label: 'Transport allowance', amount: 20000 }], deductions: [{ label: 'PAYE', amount: 18000 }, { label: 'Employee pension', amount: 14400 }, { label: 'Loan repayment', amount: 10000 }] }} />],
    ['student-id', <StudentIdDocument key="d" data={{ session: '2026/2027', studentName: 'Chiamaka Okafor', className: 'JSS 2A', admissionNo: 'CGS/2026/0142' }} />],
  ]
  for (const [n, el] of jobs) fs.writeFileSync(path.join(out, `${n}.pdf`), await renderToBuffer(el as React.ReactElement<any>))
}
main().then(() => console.log('ok'))
