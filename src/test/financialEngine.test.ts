import { describe, it, expect } from 'vitest';
import { FinancialEngine } from '../services/financialEngine';
import { INITIAL_LOANS_DATA } from '../data/initialLoansData';
import { Loan } from '../types/loan';

describe('FinancialEngine - Excel Calculations and Business Rules', () => {
  it('correctly calculates monthly interest matching Excel formula (Opening * Rate / 12)', () => {
    // Gold loan row 2: Opening = 3,005,000, Rate = 10.2%
    const monthlyInterest = FinancialEngine.calculateMonthlyInterest(3005000, 10.2);
    expect(monthlyInterest).toBeCloseTo(25542.5, 2);

    // EL 1 row 2: Opening = 1,855,461, Rate = 8.9%
    const elInterest = FinancialEngine.calculateMonthlyInterest(1855461, 8.9);
    expect(elInterest).toBeCloseTo(13761.34, 1);
  });

  it('correctly calculates principal reduced: MAX(0, EMI - Interest + Extra)', () => {
    // Gold Loan row 2: EMI = 55,000, Interest = 25,542.50, Extra = 0, Opening = 3,005,000
    const principalReduced = FinancialEngine.calculatePrincipalReduced(55000, 25542.5, 0, 3005000);
    expect(principalReduced).toBeCloseTo(29457.5, 2);

    // EL 1 row 8 (with extra prepayment): EMI = 25,000, Interest = 13,330.80, Extra = 200,000
    const redWithExtra = FinancialEngine.calculatePrincipalReduced(25000, 13330.8, 200000, 1797410.21);
    expect(redWithExtra).toBeCloseTo(211669.2, 1);
  });

  it('caps principal reduction at opening balance so closing balance never becomes negative', () => {
    // Near closure: opening balance = 15,000, regular EMI = 25,000, Interest = 100
    const reduced = FinancialEngine.calculatePrincipalReduced(25000, 100, 0, 15000);
    expect(reduced).toBe(15000);

    const closing = FinancialEngine.calculateClosingBalance(15000, reduced);
    expect(closing).toBe(0);
    expect(closing).toBeGreaterThanOrEqual(0);
  });

  it('generates Gold Loan schedule matching adjusted numbers reaching ₹29,68,724 in Oct 2026', () => {
    const goldLoan = INITIAL_LOANS_DATA.find((l) => l.id === 'gold-loan')!;
    const schedule = FinancialEngine.generateSchedule(goldLoan);

    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0].openingBalance).toBeCloseTo(3142124.04, 1);

    // October 2026 (installment 7) opening balance must be exactly ₹29,68,724 as requested
    const octInst = schedule.find((i) => i.date === '2026-10-18');
    expect(octInst).toBeDefined();
    expect(octInst!.openingBalance).toBeCloseTo(2968724, 0);

    // Final installment should close the loan at 0
    const lastInst = schedule[schedule.length - 1];
    expect(lastInst.closingBalance).toBe(0);
  });

  it('generates EL 1 schedule matching adjusted numbers reaching ₹17,97,239 in Oct 2026', () => {
    const elLoan = INITIAL_LOANS_DATA.find((l) => l.id === 'el-1')!;
    const schedule = FinancialEngine.generateSchedule(elLoan);

    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0].openingBalance).toBeCloseTo(1855297.22, 1);

    // October 2026 (installment 7) opening balance must be exactly ₹17,97,239 as requested
    const octInst = schedule.find((i) => i.date === '2026-10-18');
    expect(octInst).toBeDefined();
    expect(octInst!.openingBalance).toBeCloseTo(1797239, 0);

    const lastInst = schedule[schedule.length - 1];
    expect(lastInst.closingBalance).toBe(0);
  });

  it('calculates master dashboard summary accurately matching current debt (Gold Loan 29,68,724 + EL 1 17,97,239)', () => {
    const master = FinancialEngine.calculateMasterSummary(INITIAL_LOANS_DATA, '2026-10-18');

    // Total original principal in Master: 67,78,783
    expect(master.totalOriginalPrincipal).toBe(6778783);

    // Active Monthly EMI in Master: 80,000 (55,000 + 25,000)
    expect(master.totalMonthlyEmiCommitment).toBe(80000);

    // Active Loans count: 2 (Gold Loan and EL 1), Closed: 5
    expect(master.activeLoanCount).toBe(2);
    expect(master.closedLoanCount).toBe(5);

    // Total Current Debt as of Oct 2026: exactly 47,65,963.00 (29,68,724 + 17,97,239)
    expect(master.totalOutstandingPrincipal).toBeCloseTo(4765963.00, 0);
  });

  it('handles interest rate revisions correctly with effective dates', () => {
    const testLoan: Loan = {
      id: 'rate-test',
      name: 'Rate Test Loan',
      originalPrincipal: 1000000,
      initialOpeningBalance: 1000000,
      currentInterestRate: 10.0,
      baseEmi: 20000,
      startDate: '2026-01-01',
      repaymentDay: 1,
      status: 'active',
      rateHistory: [
        { id: 'r1', rate: 10.0, effectiveDate: '2026-01-01', note: 'Initial' },
        { id: 'r2', rate: 9.0, effectiveDate: '2026-06-01', note: 'Bank reduction' },
        { id: 'r3', rate: 8.5, effectiveDate: '2027-01-01', note: 'Further reduction' },
      ],
      extraPayments: [],
      historicalInstallments: [],
    };

    expect(FinancialEngine.getApplicableRate(testLoan.rateHistory, 10.0, '2026-03-01')).toBe(10.0);
    expect(FinancialEngine.getApplicableRate(testLoan.rateHistory, 10.0, '2026-06-01')).toBe(9.0);
    expect(FinancialEngine.getApplicableRate(testLoan.rateHistory, 10.0, '2026-09-01')).toBe(9.0);
    expect(FinancialEngine.getApplicableRate(testLoan.rateHistory, 10.0, '2027-02-01')).toBe(8.5);
  });

  it('accurately calculates extra payment impact (interest saved and tenure reduced) on custom date', () => {
    const goldLoan = INITIAL_LOANS_DATA.find((l) => l.id === 'gold-loan')!;
    
    // User scenario: add 2 Lakhs on 2026-10-10
    const impact = FinancialEngine.calculateExtraPaymentImpact(goldLoan, 200000, '2026-10-10');

    expect(impact.extraAmount).toBe(200000);
    // Interest saved should definitely NOT be 0
    expect(impact.savings.interestSaved).toBeGreaterThan(100000);
    // Tenure reduced should definitely NOT be 0
    expect(impact.savings.monthsReduced).toBeGreaterThanOrEqual(4);
    // New balance immediately reflects prepayment
    expect(impact.savings.newBalance).toBeLessThan(2800000);
  });

  it('applies extra prepayment into schedule column, reducing subsequent months and master debt', () => {
    const goldLoan = INITIAL_LOANS_DATA.find((l) => l.id === 'gold-loan')!;

    // Baseline before extra payment
    const baseSummary = FinancialEngine.calculateLoanSummary(goldLoan, '2026-10-18');
    expect(baseSummary.currentOutstandingPrincipal).toBeCloseTo(2968724, 0);

    // Apply 2 Lakhs extra payment on 2026-10-10
    const loanWithExtra: Loan = {
      ...goldLoan,
      extraPayments: [
        {
          id: 'test-ep-1',
          amount: 200000,
          date: '2026-10-10',
          note: 'Prepayment test',
        },
      ],
    };

    const schedule = FinancialEngine.generateSchedule(loanWithExtra);
    const octInst = schedule.find((i) => i.date === '2026-10-18')!;
    const novInst = schedule.find((i) => i.date === '2026-11-18')!;

    // 1. Extra Prepayment column has the 2 Lakhs
    expect(octInst.extraAmountPaid).toBe(200000);

    // 2. Principal reduced includes the 2 Lakhs
    expect(octInst.principalReduced).toBeGreaterThan(220000);

    // 3. October closing balance is reduced
    expect(octInst.closingBalance).toBeCloseTo(2738958.15, 1);

    // 4. Following month (November) opening balance strictly equals October closing balance
    expect(novInst.openingBalance).toBeCloseTo(octInst.closingBalance, 2);

    // 5. Loan Summary and Master summary current outstanding is reduced by 2 Lakhs
    const updatedSummary = FinancialEngine.calculateLoanSummary(loanWithExtra, '2026-10-18');
    expect(updatedSummary.currentOutstandingPrincipal).toBeCloseTo(2768724, 0);

    const master = FinancialEngine.calculateMasterSummary([loanWithExtra], '2026-10-18');
    expect(master.totalOutstandingPrincipal).toBeCloseTo(2768724, 0);
    expect(master.totalExtraPrincipalPaid).toBe(200000);
  });
});
