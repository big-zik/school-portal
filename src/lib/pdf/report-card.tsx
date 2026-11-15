import React from 'react'
import { Document, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { Cell, PrintPage, registerPrintFonts, ink, s } from './shared'

export interface ReportCardPdfData {
  schoolName: string
  schoolMotto: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  studentName: string
  studentId: string
  className: string
  termName: string
  academicYear: string
  attendanceSummary: {
    present: number
    total: number
    percentage: number
  }
  position: string
  outOf: number
  totalScore: number
  maxPossibleScore: number
  average: number
  grade: string
  principalRemark: string
  classTeacherRemark: string
  qrCodeDataUrl: string
  verificationUrl: string
  verificationCode: string
  subjects: Array<{
    name: string
    caScore: number
    examScore: number
    totalScore: number
    letterGrade: string
    remark: string
  }>
}

const styles = StyleSheet.create({
  summary: { fontSize: 15, fontWeight: 600, color: ink.navy, marginTop: 26 },
  commentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 26 },
  commentHead: { fontSize: 10, fontWeight: 600, color: ink.navy },
  commentBody: { fontSize: 10, marginTop: 10, lineHeight: 1.5, maxWidth: 340 },
  qr: { alignItems: 'center', width: 90 },
  qrImage: { width: 78, height: 78 },
  qrLabel: { fontSize: 7, fontWeight: 600, marginTop: 8 },
  note: { fontSize: 7, color: ink.muted, marginTop: 20 },
  sign: { flexDirection: 'row', marginTop: 24, fontSize: 8 },
})

const COLS = ['34%', '17%', '17%', '17%', '15%']

export function ReportCardDocument({ data }: { data: ReportCardPdfData }) {
  registerPrintFonts()
  const remark = [data.classTeacherRemark, data.principalRemark].filter(Boolean).join('\n')
  return (
    <Document title={`Terminal report card - ${data.studentName}`} author={data.schoolName}>
      <PrintPage
        title="Terminal report card"
        meta={`${data.studentId}  ·  ${data.termName}  ·  ${data.academicYear}`}
        session={data.academicYear}
      >
        <Text style={s.h2}>{data.studentName}</Text>
        <Text style={s.lines}>
          Class: {data.className}  ·  Admission no: {data.studentId}
          {'\n'}Attendance: {data.attendanceSummary.present} / {data.attendanceSummary.total} days  ·  Class size: {data.outOf}
        </Text>

        <View style={s.table}>
          <View style={s.trHead}>
            {['Subject', 'CA /40', 'Exam /60', 'Total /100', 'Grade'].map((h, i) => (
              <Cell key={h} w={COLS[i]} head={i === 0}>{h}</Cell>
            ))}
          </View>
          {data.subjects.map((sub) => (
            <View key={sub.name} style={s.tr} wrap={false}>
              <Cell w={COLS[0]} bold>{sub.name}</Cell>
              <Cell w={COLS[1]}>{sub.caScore}</Cell>
              <Cell w={COLS[2]}>{sub.examScore}</Cell>
              <Cell w={COLS[3]}>{sub.totalScore}</Cell>
              <Cell w={COLS[4]}>{sub.letterGrade}</Cell>
            </View>
          ))}
        </View>

        <Text style={styles.summary}>
          Term average: {Math.round(data.average)}%   ·   Total: {data.totalScore} / {data.maxPossibleScore}
        </Text>

        <View style={styles.commentRow} wrap={false}>
          <View>
            <Text style={styles.commentHead}>Teacher’s comment</Text>
            <Text style={styles.commentBody}>{remark || ' '}</Text>
          </View>
          {data.qrCodeDataUrl ? (
            <View style={styles.qr}>
              <Image style={styles.qrImage} src={data.qrCodeDataUrl} />
              <Text style={styles.qrLabel}>Scan to verify</Text>
              <Text style={[styles.qrLabel, { fontWeight: 400, marginTop: 2 }]}>{data.verificationCode}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sign}>
          <Text>Class teacher ________________   </Text>
          <Text>Head teacher ________________</Text>
        </View>
        <Text style={styles.note}>Verify this report at {data.verificationUrl}</Text>
      </PrintPage>
    </Document>
  )
}
