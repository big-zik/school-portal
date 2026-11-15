import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

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
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0F2A44',
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#0B3A6B',
    paddingBottom: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B3A6B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  schoolMotto: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#4B5E71',
    marginBottom: 3,
  },
  schoolContact: {
    fontSize: 7.5,
    color: '#4B5E71',
  },
  docBadge: {
    backgroundColor: '#E8F6FA',
    borderWidth: 1,
    borderColor: '#B9E2EE',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  docBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0D5EA7',
  },
  studentSection: {
    backgroundColor: '#F7F4EA',
    borderWidth: 1,
    borderColor: '#E5DEC9',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentCol: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4B5E71',
    width: 85,
  },
  fieldValue: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0F2A44',
  },
  table: {
    borderWidth: 1,
    borderColor: '#C9CFD9',
    borderRadius: 4,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0B3A6B',
    color: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1ECDD',
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 8,
  },
  tableRowAlt: {
    backgroundColor: '#F7F4EA',
  },
  colSubject: { width: '30%' },
  colCa: { width: '12%', textAlign: 'center' },
  colExam: { width: '12%', textAlign: 'center' },
  colTotal: { width: '12%', textAlign: 'center' },
  colGrade: { width: '10%', textAlign: 'center' },
  colRemark: { width: '24%' },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F1ECDD',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5DEC9',
  },
  summaryItem: {
    textAlign: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 7.5,
    color: '#4B5E71',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0B3A6B',
  },
  remarksSection: {
    borderWidth: 1,
    borderColor: '#E5DEC9',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  remarkBlock: {
    marginBottom: 6,
  },
  remarkTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0B3A6B',
    marginBottom: 2,
  },
  remarkText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#2B4260',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5DEC9',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrImage: {
    width: 50,
    height: 50,
  },
  qrTextContainer: {
    maxWidth: 200,
  },
  qrTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#047857',
  },
  qrDesc: {
    fontSize: 6.5,
    color: '#4B5E71',
    marginTop: 1,
  },
  signatureBlock: {
    textAlign: 'right',
  },
  signatureLine: {
    width: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#0F2A44',
    marginBottom: 3,
  },
  signatoryTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0F2A44',
  },
  stampText: {
    fontSize: 6.5,
    color: '#4B5E71',
  },
})

export function ReportCardDocument({ data }: { data: ReportCardPdfData }) {
  return (
    <Document title={`${data.studentName} - Report Card (${data.termName})`}>
      <Page size="A4" style={styles.page}>
        {/* School Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.schoolName}>{data.schoolName}</Text>
            <Text style={styles.schoolMotto}>"{data.schoolMotto}"</Text>
            <Text style={styles.schoolContact}>
              {data.schoolAddress} • {data.schoolPhone} • {data.schoolEmail}
            </Text>
          </View>
          <View style={styles.docBadge}>
            <Text style={styles.docBadgeText}>OFFICIAL TERMINAL REPORT</Text>
            <Text style={{ fontSize: 7, color: '#4B5E71', marginTop: 2, textAlign: 'center' }}>
              {data.academicYear} • {data.termName}
            </Text>
          </View>
        </View>

        {/* Student Biodata Box */}
        <View style={styles.studentSection}>
          <View style={styles.studentCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Student Name:</Text>
              <Text style={styles.fieldValue}>{data.studentName}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Student ID / Reg:</Text>
              <Text style={styles.fieldValue}>{data.studentId}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Class / Grade:</Text>
              <Text style={styles.fieldValue}>{data.className}</Text>
            </View>
          </View>

          <View style={styles.studentCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Academic Term:</Text>
              <Text style={styles.fieldValue}>{data.termName}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Class Position:</Text>
              <Text style={[styles.fieldValue, { color: '#0B3A6B' }]}>
                {data.position} of {data.outOf} students
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Attendance:</Text>
              <Text style={styles.fieldValue}>
                {data.attendanceSummary.present} / {data.attendanceSummary.total} days ({data.attendanceSummary.percentage}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSubject}>Subject Title</Text>
            <Text style={styles.colCa}>CA (40)</Text>
            <Text style={styles.colExam}>Exam (60)</Text>
            <Text style={styles.colTotal}>Total (100)</Text>
            <Text style={styles.colGrade}>Grade</Text>
            <Text style={styles.colRemark}>Teacher Remark</Text>
          </View>

          {data.subjects.map((s, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.colSubject, { fontWeight: 'bold' }]}>{s.name}</Text>
              <Text style={styles.colCa}>{s.caScore}</Text>
              <Text style={styles.colExam}>{s.examScore}</Text>
              <Text style={[styles.colTotal, { fontWeight: 'bold', color: '#0B3A6B' }]}>
                {s.totalScore}
              </Text>
              <Text style={[styles.colGrade, { fontWeight: 'bold' }]}>{s.letterGrade}</Text>
              <Text style={styles.colRemark}>{s.remark}</Text>
            </View>
          ))}
        </View>

        {/* Statistical Summary Box */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Score</Text>
            <Text style={styles.summaryValue}>
              {data.totalScore} / {data.maxPossibleScore}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Percentage</Text>
            <Text style={styles.summaryValue}>{data.average.toFixed(1)}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Overall Grade</Text>
            <Text style={[styles.summaryValue, { color: '#047857' }]}>{data.grade}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Final Position</Text>
            <Text style={[styles.summaryValue, { color: '#0B3A6B' }]}>{data.position}</Text>
          </View>
        </View>

        {/* Teacher & Principal Remarks */}
        <View style={styles.remarksSection}>
          <View style={styles.remarkBlock}>
            <Text style={styles.remarkTitle}>Form Master / Class Teacher Remarks:</Text>
            <Text style={styles.remarkText}>{data.classTeacherRemark}</Text>
          </View>
          <View style={{ ...styles.remarkBlock, marginBottom: 0 }}>
            <Text style={styles.remarkTitle}>Head of School / Principal Endorsement:</Text>
            <Text style={styles.remarkText}>{data.principalRemark}</Text>
          </View>
        </View>

        {/* Footer with Anti-Fraud Verification QR Code */}
        <View style={styles.footer}>
          <View style={styles.qrContainer}>
            {data.qrCodeDataUrl ? (
              <Image style={styles.qrImage} src={data.qrCodeDataUrl} />
            ) : null}
            <View style={styles.qrTextContainer}>
              <Text style={styles.qrTitle}>SECURE DIGITAL VERIFICATION</Text>
              <Text style={styles.qrDesc}>
                Scan with any smartphone camera to authenticate genuine grades on the portal.
              </Text>
              <Text style={{ fontSize: 6, color: '#5D6B81', marginTop: 2 }}>
                Ref: {data.verificationCode}
              </Text>
            </View>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatoryTitle}>Dr. Mrs. Folashade Adeleke</Text>
            <Text style={styles.stampText}>Principal & Academic Director</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
