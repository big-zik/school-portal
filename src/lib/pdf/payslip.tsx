import React from 'react'
import { Document, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Cell, PrintPage, registerPrintFonts, ink, s } from './shared'

export interface PayslipPdfData {
  session: string
  payslipNo: string
  periodLabel: string
  staffName: string
  staffId: string
  role: string
  paymentDateLabel: string
  bankLast4: string
  earnings: Array<{ label: string; amount: number }>
  deductions: Array<{ label: string; amount: number }>
}

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`
const st = StyleSheet.create({
  net: { marginTop: 26, backgroundColor: ink.tint, paddingVertical: 22, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netLabel: { fontSize: 11, fontWeight: 600, color: ink.navy },
  netValue: { fontSize: 22, fontWeight: 700, color: ink.navy },
})

function Block({ head, rows, totalLabel }: { head: string; rows: Array<{ label: string; amount: number }>; totalLabel: string }) {
  const total = rows.reduce((a, r) => a + r.amount, 0)
  return (
    <View style={[s.table, { marginTop: 20 }]}>
      <View style={s.trHead}><Cell w="66%" head>{head}</Cell><Cell w="34%">Amount</Cell></View>
      {rows.map((r) => (
        <View key={r.label} style={s.tr}><Cell w="66%" bold>{r.label}</Cell><Cell w="34%">{naira(r.amount)}</Cell></View>
      ))}
      <View style={s.tr}><Cell w="66%" bold>{totalLabel}</Cell><Cell w="34%">{naira(total)}</Cell></View>
    </View>
  )
}

export function PayslipDocument({ data }: { data: PayslipPdfData }) {
  registerPrintFonts()
  const gross = data.earnings.reduce((a, r) => a + r.amount, 0)
  const ded = data.deductions.reduce((a, r) => a + r.amount, 0)
  return (
    <Document title={`Payslip ${data.payslipNo}`}>
      <PrintPage title="Staff payslip" meta={`${data.payslipNo}  ·  ${data.periodLabel}  ·  Confidential`} session={data.session}>
        <Text style={s.h2}>{data.staffName}</Text>
        <Text style={s.lines}>
          Staff ID: {data.staffId}  ·  {data.role}
          {'\n'}Payment date: {data.paymentDateLabel}  ·  Bank account: •••• {data.bankLast4}
        </Text>
        <Block head="Earnings" rows={data.earnings} totalLabel="Gross pay" />
        <Block head="Deductions" rows={data.deductions} totalLabel="Total deductions" />
        <View style={st.net}>
          <Text style={st.netLabel}>NET PAY</Text>
          <Text style={st.netValue}>{naira(gross - ded)}</Text>
        </View>
      </PrintPage>
    </Document>
  )
}
