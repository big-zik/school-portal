import React from 'react'
import { Document, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Cell, PrintPage, registerPrintFonts, ink, s } from './shared'

export interface FeeReceiptPdfData {
  session: string
  receiptNo: string
  paidAtLabel: string
  amount: number
  amountInWords: string
  studentName: string
  className: string
  admissionNo: string
  invoiceNo: string
  termName: string
  paidBy: string
  method: string
  reference: string
  invoiceTotal: number
  previouslyPaid: number
  balance: number
}

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`
const st = StyleSheet.create({
  status: { fontSize: 15, fontWeight: 600, color: ink.success, marginTop: 24 },
  amount: { fontSize: 38, fontWeight: 700, color: ink.navy, marginTop: 20 },
  words: { fontSize: 11, marginTop: 14 },
  totals: { marginTop: 26 },
  line: { flexDirection: 'row', fontSize: 12, fontWeight: 600, color: ink.navy, marginBottom: 4 },
  lineLabel: { width: 100 },
})

export function FeeReceiptDocument({ data }: { data: FeeReceiptPdfData }) {
  registerPrintFonts()
  const rows: [string, string][] = [
    ['Student', `${data.studentName} · ${data.className}`],
    ['Admission number', data.admissionNo],
    ['Invoice', `${data.invoiceNo} · ${data.termName}`],
    ['Paid by', data.paidBy],
    ['Payment method', data.method],
    ['Transaction reference', data.reference],
  ]
  return (
    <Document title={`Fee receipt ${data.receiptNo}`}>
      <PrintPage title="Fee receipt voucher" meta={`${data.receiptNo}  ·  ${data.paidAtLabel}`} session={data.session}>
        <Text style={st.status}>Payment received</Text>
        <Text style={st.amount}>{naira(data.amount)}.00</Text>
        <Text style={st.words}>{data.amountInWords}</Text>
        <View style={s.table}>
          <View style={s.trHead}>
            <Cell w="35%" head>Payment details</Cell>
            <Cell w="65%">Record</Cell>
          </View>
          {rows.map(([k, v]) => (
            <View key={k} style={s.tr}>
              <Cell w="35%" bold>{k}</Cell>
              <Cell w="65%">{v}</Cell>
            </View>
          ))}
        </View>
        <View style={st.totals}>
          {([
            ['Invoice total', naira(data.invoiceTotal)],
            ['Previously paid', naira(data.previouslyPaid)],
            ['This payment', naira(data.amount)],
            ['Balance', naira(data.balance)],
          ] as const).map(([k, v]) => (
            <View key={k} style={st.line}><Text style={st.lineLabel}>{k}</Text><Text>{v}</Text></View>
          ))}
        </View>
      </PrintPage>
    </Document>
  )
}
