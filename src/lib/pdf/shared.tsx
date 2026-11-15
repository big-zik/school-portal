import React from 'react'
import path from 'path'
import { Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

// Inter (SIL OFL) with Latin + Latin Extended so the Naira sign (₦) renders.
const dir = path.join(process.cwd(), 'src/lib/pdf/fonts')
let registered = false
export function registerPrintFonts() {
  if (registered) return
  registered = true
  Font.register({
    family: 'Inter',
    fonts: [
      { src: path.join(dir, 'Inter-400.ttf'), fontWeight: 400 },
      { src: path.join(dir, 'Inter-600.ttf'), fontWeight: 600 },
      { src: path.join(dir, 'Inter-700.ttf'), fontWeight: 700 },
    ],
  })
  Font.registerHyphenationCallback((w) => [w])
}

// Print palette: dark rules and explicit labels so it stays legible in black and white.
export const ink = {
  navy: '#0B3A6B',
  text: '#0F2A44',
  muted: '#475569',
  rule: '#64748B',
  tint: '#E8F6FA',
  success: '#047857',
}

export const s = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 9, color: ink.text, paddingTop: 30, paddingHorizontal: 35, paddingBottom: 70, backgroundColor: '#fff' },
  topRule: { height: 4, backgroundColor: ink.navy },
  head: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  tile: { width: 40, height: 40, borderRadius: 8, backgroundColor: ink.tint, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontSize: 14, fontWeight: 600, color: ink.navy },
  lock: { marginLeft: 8, width: 90 },
  lockMain: { fontSize: 9, fontWeight: 600, color: ink.navy, lineHeight: 1.25 },
  lockSub: { fontSize: 7, color: ink.navy, marginTop: 2 },
  school: { marginLeft: 54 },
  schoolName: { fontSize: 11, fontWeight: 600, color: ink.navy },
  session: { fontSize: 8, color: ink.navy, marginTop: 6 },
  title: { fontSize: 25, fontWeight: 600, color: ink.navy, marginTop: 38 },
  meta: { fontSize: 8, color: ink.muted, marginTop: 8 },
  hr: { borderBottomWidth: 0.75, borderBottomColor: ink.rule, marginTop: 14 },
  h2: { fontSize: 17, fontWeight: 600, color: ink.navy, marginTop: 20 },
  lines: { fontSize: 10, marginTop: 10, lineHeight: 1.55 },
  table: { marginTop: 24, borderWidth: 0.75, borderColor: ink.rule },
  tr: { flexDirection: 'row', borderTopWidth: 0.75, borderTopColor: ink.rule, minHeight: 31 },
  trHead: { flexDirection: 'row', backgroundColor: ink.tint, minHeight: 31 },
  td: { paddingHorizontal: 8, justifyContent: 'center', borderLeftWidth: 0.75, borderLeftColor: ink.rule, fontSize: 8.5 },
  th: { fontSize: 8, fontWeight: 600, color: ink.navy },
  bold: { fontWeight: 600 },
  footer: { position: 'absolute', left: 35, right: 35, bottom: 28, borderTopWidth: 0.75, borderTopColor: ink.rule, paddingTop: 11 },
  footMain: { fontSize: 8 },
  footSub: { fontSize: 7, color: ink.muted, marginTop: 6 },
})

export function Cell({ w, head, bold, children }: { w: string; head?: boolean; bold?: boolean; children?: React.ReactNode }) {
  return (
    <View style={[s.td, { flexGrow: parseFloat(w), flexBasis: 0 }, head ? { borderLeftWidth: 0 } : {}]}>
      <Text style={head ? s.th : bold ? s.bold : undefined}>{children}</Text>
    </View>
  )
}

export function PrintPage({ title, meta, session, children }: { title: string; meta: string; session: string; children: React.ReactNode }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.topRule} fixed />
      <View style={s.head}>
        <View style={s.tile}><Text style={s.tileText}>CG</Text></View>
        <View style={s.lock}>
          <Text style={s.lockMain}>CHOSEN{'\n'}GENERATION</Text>
          <Text style={s.lockSub}>Born to Excel</Text>
        </View>
        <View style={s.school}>
          <Text style={s.schoolName}>CHOSEN GENERATION SCHOOL</Text>
          <Text style={s.session}>Born to Excel  ·  {session} session</Text>
        </View>
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.meta}>{meta}</Text>
      <View style={s.hr} />
      {children}
      <View style={s.footer} fixed>
        <Text style={s.footMain}>Chosen Generation School  ·  Born to Excel</Text>
        <Text style={s.footSub}>Illustrative school record  ·  Replace the temporary brand lockup before issue.</Text>
      </View>
    </Page>
  )
}
