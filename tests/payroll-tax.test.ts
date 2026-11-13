import { calculateNigerianPAYE } from '@/lib/utils/payroll'

describe('Nigerian PAYE Tax Calculator (PITA 2011 as amended)', () => {
  it('applies Consolidated Relief Allowance (CRA) correctly: higher of 200k or 1% plus 20%', () => {
    // ₦300,000 monthly gross = ₦3,600,000 annual gross
    // 1% of 3.6m = 36,000. Higher of 200,000 or 36,000 is 200,000.
    // Plus 20% of 3.6m = 720,000.
    // Total CRA = 200,000 + 720,000 = 920,000.
    const monthlyGrossKobo = 30000000 // ₦300,000 in kobo
    const monthlyPensionKobo = 2400000 // ₦24,000 (8% of 300k)

    const result = calculateNigerianPAYE(monthlyGrossKobo, monthlyPensionKobo)

    expect(result.annualGrossKobo).toBe(360000000) // ₦3.6m
    expect(result.annualPensionKobo).toBe(28800000) // ₦288k
    expect(result.annualCraKobo).toBe(92000000) // ₦920k

    // Taxable = 3,600,000 - (920,000 + 288,000) = 2,392,000
    expect(result.annualTaxableKobo).toBe(239200000)
  })

  it('calculates progressive tax bands accurately across all tax tiers', () => {
    // Annual Taxable = 2,392,000:
    // First 300,000 @ 7% = 21,000
    // Next 300,000 @ 11% = 33,000
    // Next 500,000 @ 15% = 75,000
    // Next 500,000 @ 19% = 95,000
    // Remaining (2,392,000 - 1,600,000 = 792,000) @ 21% = 166,320
    // Total annual tax = 21,000 + 33,000 + 75,000 + 95,000 + 166,320 = 390,320
    // Monthly tax = 390,320 / 12 = 32,526.67 => 32,527 kobo-rounded (3,252,667 kobo)
    const monthlyGrossKobo = 30000000
    const monthlyPensionKobo = 2400000

    const result = calculateNigerianPAYE(monthlyGrossKobo, monthlyPensionKobo)

    expect(result.annualTaxKobo).toBe(39032000)
    expect(result.monthlyTaxKobo).toBe(Math.round(39032000 / 12))
    expect(result.effectiveTaxRate).toBeCloseTo(10.84, 1)
    expect(result.isMinimumTaxApplied).toBe(false)
  })

  it('applies minimum tax rule of 1% when computed tax is lower than 1% of gross', () => {
    // Low gross where reliefs exceed or nearly match gross:
    // Monthly gross ₦20,000 = Annual ₦240,000
    // 1% of 240,000 is 2,400.
    const monthlyGrossKobo = 2000000 // ₦20,000
    const result = calculateNigerianPAYE(monthlyGrossKobo, 0)

    expect(result.isMinimumTaxApplied).toBe(true)
    expect(result.annualTaxKobo).toBe(240000) // 1% of 240,000 in kobo = 2,400 * 100
    expect(result.monthlyTaxKobo).toBe(Math.round(240000 / 12))
  })

  it('handles 0 gross income gracefully', () => {
    const result = calculateNigerianPAYE(0, 0)
    expect(result.monthlyTaxKobo).toBe(0)
    expect(result.annualTaxKobo).toBe(0)
    expect(result.effectiveTaxRate).toBe(0)
  })
})
