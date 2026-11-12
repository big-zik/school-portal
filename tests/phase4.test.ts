describe('Phase 4: Extended Modules', () => {
  describe('CBT Scoring & Automated Evaluation', () => {
    interface Question {
      id: string
      correctOption: string
      marks: number
    }

    function evaluateCBT(questions: Question[], answers: Record<string, string>, passingScore: number) {
      let marksObtained = 0
      let totalMarks = 0

      for (const q of questions) {
        totalMarks += q.marks
        if (answers[q.id] === q.correctOption) {
          marksObtained += q.marks
        }
      }

      const percentage = Math.round((marksObtained / totalMarks) * 100)
      const passed = percentage >= passingScore

      return { marksObtained, totalMarks, percentage, passed }
    }

    const mockQuestions: Question[] = [
      { id: 'q1', correctOption: 'A', marks: 10 },
      { id: 'q2', correctOption: 'C', marks: 10 },
      { id: 'q3', correctOption: 'B', marks: 10 },
      { id: 'q4', correctOption: 'D', marks: 10 },
    ]

    it('calculates 100% when all answers are correct', () => {
      const answers = { q1: 'A', q2: 'C', q3: 'B', q4: 'D' }
      const res = evaluateCBT(mockQuestions, answers, 50)
      expect(res.marksObtained).toBe(40)
      expect(res.percentage).toBe(100)
      expect(res.passed).toBe(true)
    })

    it('correctly detects failing score below passing threshold', () => {
      const answers = { q1: 'A', q2: 'A', q3: 'A', q4: 'A' } // only 1 correct (25%)
      const res = evaluateCBT(mockQuestions, answers, 50)
      expect(res.marksObtained).toBe(10)
      expect(res.percentage).toBe(25)
      expect(res.passed).toBe(false)
    })
  })

  describe('Staff Payroll Computations', () => {
    function computeStaffPayroll(baseSalaryKobo: number) {
      const housingKobo = Math.round(baseSalaryKobo * 0.2)
      const transportKobo = Math.round(baseSalaryKobo * 0.1)
      const grossKobo = baseSalaryKobo + housingKobo + transportKobo

      const pensionKobo = Math.round(baseSalaryKobo * 0.08) // 8% statutory employee pension
      const taxKobo = Math.round(grossKobo * 0.07) // PAYE tax
      const totalDeductionsKobo = pensionKobo + taxKobo
      const netPayKobo = grossKobo - totalDeductionsKobo

      return { grossKobo, pensionKobo, taxKobo, totalDeductionsKobo, netPayKobo }
    }

    it('computes 20% housing and 10% transport allowances', () => {
      const base = 20000000 // 200,000 NGN
      const res = computeStaffPayroll(base)
      expect(res.grossKobo).toBe(26000000) // 200k + 40k + 20k = 260k
    })

    it('deducts exact 8% statutory pension from basic', () => {
      const base = 25000000 // 250,000 NGN
      const res = computeStaffPayroll(base)
      expect(res.pensionKobo).toBe(2000000) // 20,000 NGN (8%)
    })

    it('guarantees gross equals net pay plus total deductions', () => {
      const base = 30000000
      const res = computeStaffPayroll(base)
      expect(res.netPayKobo + res.totalDeductionsKobo).toBe(res.grossKobo)
    })
  })

  describe('Inventory Low-Stock Alerts', () => {
    function isStockLow(quantity: number, reorderThreshold: number): boolean {
      return quantity <= reorderThreshold
    }

    it('triggers alert when stock falls to or below threshold', () => {
      expect(isStockLow(5, 10)).toBe(true)
      expect(isStockLow(10, 10)).toBe(true)
      expect(isStockLow(15, 10)).toBe(false)
    })
  })
})
