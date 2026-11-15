import React from 'react'
import { Document, Image, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PrintPage, registerPrintFonts, ink } from './shared'

export interface StudentIdPdfData {
  session: string
  studentName: string
  className: string
  admissionNo: string
  photoSrc?: string
}

// ID-1 trim 85.6 x 54 mm = 242.6 x 153.1 pt
const W = 242.6
const H = 153.1
const st = StyleSheet.create({
  cards: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 52 },
  card: { width: W, height: H, borderWidth: 0.75, borderColor: ink.navy, borderRadius: 9, overflow: 'hidden' },
  band: { backgroundColor: ink.navy, height: 31, justifyContent: 'center', paddingHorizontal: 10 },
  bandText: { color: '#fff', fontSize: 8, fontWeight: 600 },
  body: { flexDirection: 'row', padding: 10 },
  photo: { width: 56, height: 66, backgroundColor: ink.tint },
  info: { marginLeft: 12 },
  name: { fontSize: 10.5, fontWeight: 600, color: ink.navy, marginTop: 6 },
  line: { fontSize: 7.5, marginTop: 5 },
  tag: { position: 'absolute', left: 10, bottom: 8, fontSize: 6.5, fontWeight: 600, color: ink.navy },
  back: { padding: 12 },
  backLogo: { flexDirection: 'row', alignItems: 'center' },
  miniTile: { width: 26, height: 26, borderRadius: 6, backgroundColor: ink.tint, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 7, lineHeight: 1.5, marginTop: 22 },
  h2: { fontSize: 17, fontWeight: 600, color: ink.navy, marginTop: 66 },
  li: { fontSize: 10.5, marginTop: 9 },
})

const NOTES = [
  'Print at 100%, never fit to page. Add 3mm bleed in the print production layout.',
  'Keep text 3mm inside the trim. Cut along the card boundary.',
  'Replace temporary lockup with the official school crest.',
  'Student photo is an illustrative generated portrait, not a real student record.',
  'B&W-safe: explicit labels, dark rules and no colour-only meaning.',
]

export function StudentIdDocument({ data }: { data: StudentIdPdfData }) {
  registerPrintFonts()
  return (
    <Document title={`Student ID - ${data.studentName}`}>
      <PrintPage title="Student identity card" meta="A4 print carrier  ·  ID-1 trim size 85.6 × 54mm  ·  Front and reverse" session={data.session}>
        <View style={st.cards}>
          <View style={st.card}>
            <View style={st.band}><Text style={st.bandText}>CHOSEN GENERATION SCHOOL</Text></View>
            <View style={st.body}>
              {data.photoSrc ? <Image src={data.photoSrc} style={st.photo} /> : <View style={st.photo} />}
              <View style={st.info}>
                <Text style={st.name}>{data.studentName}</Text>
                <Text style={st.line}>{data.className}</Text>
                <Text style={st.line}>{data.admissionNo}</Text>
                <Text style={st.line}>{data.session} session</Text>
              </View>
            </View>
            <Text style={st.tag}>STUDENT  ·  Born to Excel</Text>
          </View>
          <View style={[st.card, st.back]}>
            <View style={st.backLogo}>
              <View style={st.miniTile}><Text style={{ fontSize: 8, fontWeight: 600, color: ink.navy }}>CG</Text></View>
              <Text style={{ fontSize: 6.5, fontWeight: 600, color: ink.navy, marginLeft: 6, lineHeight: 1.2 }}>CHOSEN{'\n'}GENERATION</Text>
            </View>
            <Text style={st.backText}>
              This card belongs to Chosen Generation School.{'\n'}If found, please return it to the school office.{'\n\n'}
              Valid for the {data.session} session only.{'\n'}Do not publish student identity details online.
            </Text>
          </View>
        </View>
        <Text style={st.h2}>Production notes</Text>
        {NOTES.map((n) => <Text key={n} style={st.li}>•  {n}</Text>)}
      </PrintPage>
    </Document>
  )
}
