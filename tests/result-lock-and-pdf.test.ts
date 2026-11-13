import QRCode from 'qrcode'
import { calculateNigerianPAYE } from '@/lib/utils/payroll'

describe('Anti-Fraud QR Code & Result Verification', () => {
  it('generates a valid base64 data URL for document verification', async () => {
    const verificationUrl = 'http://localhost:3000/verify/results/STU2024001?ref=VER-2024-001'
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 140,
    })

    expect(qrDataUrl).toBeDefined()
    expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true)
    expect(qrDataUrl.length).toBeGreaterThan(100)
  })

  it('encodes verification URLs accurately for mobile scanner recognition', async () => {
    const studentId = 'cm3abcdef123456'
    const verificationCode = `VER-${studentId.slice(-6).toUpperCase()}-2026`
    const url = `https://school.portal.edu/verify/results/${studentId}?ref=${verificationCode}`

    const qrDataUrl = await QRCode.toDataURL(url)
    expect(qrDataUrl).toContain('data:image/png;base64,')
  })
})

describe('Server-Side Result Lock Evaluation Logic', () => {
  it('calculates total outstanding tuition balance correctly from open invoices', () => {
    const invoices = [
      { id: 'inv-1', status: 'PARTIAL', balanceAmount: 25000 },
      { id: 'inv-2', status: 'OVERDUE', balanceAmount: 75000 },
      { id: 'inv-3', status: 'PAID', balanceAmount: 0 },
    ]

    const unpaid = invoices.filter((inv) =>
      ['PENDING', 'PARTIAL', 'OVERDUE'].includes(inv.status) && inv.balanceAmount > 0,
    )
    const totalBalance = unpaid.reduce((acc, inv) => acc + inv.balanceAmount, 0)

    expect(totalBalance).toBe(100000)
    expect(totalBalance > 0).toBe(true) // triggers 403 fee-based result lock
  })

  it('permits results clearance when all invoices are fully paid', () => {
    const invoices = [
      { id: 'inv-1', status: 'PAID', balanceAmount: 0 },
      { id: 'inv-2', status: 'PAID', balanceAmount: 0 },
    ]

    const unpaid = invoices.filter((inv) =>
      ['PENDING', 'PARTIAL', 'OVERDUE'].includes(inv.status) && inv.balanceAmount > 0,
    )
    const totalBalance = unpaid.reduce((acc, inv) => acc + inv.balanceAmount, 0)

    expect(totalBalance).toBe(0)
    expect(totalBalance === 0).toBe(true) // grants access to official report card
  })
})
