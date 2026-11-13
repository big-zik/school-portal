/**
 * Nigerian PAYE Tax Calculator
 *
 * Implements Personal Income Tax Act (PITA 2011 as amended):
 * 1. Consolidated Relief Allowance (CRA):
 *    - Higher of NGN 200,000 or 1% of Gross Income, PLUS 20% of Gross Income.
 * 2. Statutory Pension Relief: 8% employee contribution.
 * 3. Chargeable (Taxable) Income = Gross Income - (CRA + Pension).
 * 4. Progressive Tax Brackets (Annual):
 *    - First NGN 300,000  @  7%
 *    - Next  NGN 300,000  @ 11%  (300,001 - 600,000)
 *    - Next  NGN 500,000  @ 15%  (600,001 - 1,100,000)
 *    - Next  NGN 500,000  @ 19%  (1,100,001 - 1,600,000)
 *    - Next  NGN 1,600,000 @ 21% (1,600,001 - 3,200,000)
 *    - Above NGN 3,200,000 @ 24%
 * 5. Minimum Tax Rule:
 *    - If computed tax is less than 1% of Gross Income, PAYE tax is minimum 1% of Gross Income.
 */

export interface NigerianTaxBracket {
  label: string
  rate: number
  limitNaira: number
  taxableNaira: number
  taxNaira: number
}

export interface NigerianPAYEResult {
  monthlyGrossKobo: number
  annualGrossKobo: number
  monthlyPensionKobo: number
  annualPensionKobo: number
  annualCraKobo: number
  annualTaxableKobo: number
  annualTaxKobo: number
  monthlyTaxKobo: number
  effectiveTaxRate: number
  isMinimumTaxApplied: boolean
  brackets: NigerianTaxBracket[]
}

const BRACKETS = [
  { label: 'First ₦300,000', limit: 300_000, rate: 0.07 },
  { label: 'Next ₦300,000', limit: 300_000, rate: 0.11 },
  { label: 'Next ₦500,000', limit: 500_000, rate: 0.15 },
  { label: 'Next ₦500,000', limit: 500_000, rate: 0.19 },
  { label: 'Next ₦1,600,000', limit: 1_600_000, rate: 0.21 },
  { label: 'Above ₦3,200,000', limit: Infinity, rate: 0.24 },
]

/**
 * Calculates Nigerian PAYE tax given monthly gross earnings and monthly pension in Kobo.
 */
export function calculateNigerianPAYE(
  monthlyGrossKobo: number,
  monthlyPensionKobo: number = 0,
): NigerianPAYEResult {
  const monthlyGrossNaira = monthlyGrossKobo / 100
  const monthlyPensionNaira = monthlyPensionKobo / 100

  const annualGrossNaira = monthlyGrossNaira * 12
  const annualPensionNaira = monthlyPensionNaira * 12

  // Consolidated Relief Allowance (CRA):
  // Higher of ₦200,000 or 1% of Gross Income, plus 20% of Gross Income
  const baseRelief = Math.max(200_000, 0.01 * annualGrossNaira)
  const percentageRelief = 0.20 * annualGrossNaira
  const annualCraNaira = annualGrossNaira > 0 ? baseRelief + percentageRelief : 0

  const totalReliefsNaira = annualCraNaira + annualPensionNaira
  const annualTaxableNaira = Math.max(0, annualGrossNaira - totalReliefsNaira)

  // Compute tax through progressive brackets
  let remainingTaxable = annualTaxableNaira
  let computedAnnualTaxNaira = 0
  const bracketDetails: NigerianTaxBracket[] = []

  for (const b of BRACKETS) {
    if (remainingTaxable <= 0) {
      bracketDetails.push({
        label: b.label,
        rate: b.rate,
        limitNaira: b.limit,
        taxableNaira: 0,
        taxNaira: 0,
      })
      continue
    }

    const taxableInBracket = Math.min(remainingTaxable, b.limit)
    const taxInBracket = taxableInBracket * b.rate

    computedAnnualTaxNaira += taxInBracket
    remainingTaxable -= taxableInBracket

    bracketDetails.push({
      label: b.label,
      rate: b.rate,
      limitNaira: b.limit,
      taxableNaira: Math.round(taxableInBracket * 100) / 100,
      taxNaira: Math.round(taxInBracket * 100) / 100,
    })
  }

  // Minimum Tax Rule (Section 37 PITA): Minimum 1% of Gross Income
  const minimumTaxNaira = 0.01 * annualGrossNaira
  let finalAnnualTaxNaira = computedAnnualTaxNaira
  let isMinimumTaxApplied = false

  if (annualGrossNaira > 0 && computedAnnualTaxNaira < minimumTaxNaira) {
    finalAnnualTaxNaira = minimumTaxNaira
    isMinimumTaxApplied = true
  }

  const annualTaxKobo = Math.round(finalAnnualTaxNaira * 100)
  const monthlyTaxKobo = Math.round(annualTaxKobo / 12)
  const effectiveTaxRate =
    annualGrossNaira > 0
      ? Math.round((finalAnnualTaxNaira / annualGrossNaira) * 10000) / 100
      : 0

  return {
    monthlyGrossKobo,
    annualGrossKobo: Math.round(annualGrossNaira * 100),
    monthlyPensionKobo,
    annualPensionKobo: Math.round(annualPensionNaira * 100),
    annualCraKobo: Math.round(annualCraNaira * 100),
    annualTaxableKobo: Math.round(annualTaxableNaira * 100),
    annualTaxKobo,
    monthlyTaxKobo,
    effectiveTaxRate,
    isMinimumTaxApplied,
    brackets: bracketDetails,
  }
}
