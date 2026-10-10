import {
  Loan,
  Installment,
  RateRevision,
  ExtraPayment,
  LoanSummary,
  MasterDashboardSummary,
  ExtraPaymentImpact,
} from '../types/loan';
import { addMonths } from '../utils/dateUtils';

/**
 * Financial Calculation Engine adhering strictly to the user's Excel formulas:
 * 1. Monthly Interest = Opening Balance × Annual Interest Rate / 12
 * 2. Principal Reduced = MAX(0, EMI Amount - Monthly Interest + Extra Amount Paid)
 * 3. Closing Balance = MAX(0, Opening Balance - Principal Reduced)
 * 4. Next Month's Opening Balance = Previous Month's Closing Balance
 */
export class FinancialEngine {
  /**
   * Determine the applicable interest rate percentage for a given date
   */
  public static getApplicableRate(
    rateHistory: RateRevision[],
    defaultRate: number,
    installmentDate: string
  ): number {
    if (!rateHistory || rateHistory.length === 0) {
      return defaultRate;
    }

    // Sort rate revisions chronologically by effectiveDate
    const sorted = [...rateHistory].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

    // Find the latest revision with effectiveDate <= installmentDate
    let activeRate = defaultRate;
    let found = false;

    for (const revision of sorted) {
      if (revision.effectiveDate <= installmentDate) {
        activeRate = revision.rate;
        found = true;
      } else {
        break;
      }
    }

    if (!found && sorted.length > 0) {
      // If installment date is before the first revision, use the first revision's rate
      return sorted[0].rate;
    }

    return activeRate;
  }

  /**
   * Excel Formula:
   * Monthly Interest = Opening Balance × Annual Interest Rate / 12
   */
  public static calculateMonthlyInterest(
    openingBalance: number,
    annualInterestRatePercent: number
  ): number {
    if (openingBalance <= 0 || annualInterestRatePercent <= 0) {
      return 0;
    }
    return (openingBalance * (annualInterestRatePercent / 100)) / 12;
  }

  /**
   * Excel Formula:
   * Principal Reduced = MAX(0, EMI Amount - Monthly Interest + Extra Amount Paid)
   * Capped at Opening Balance so balance never goes negative.
   */
  public static calculatePrincipalReduced(
    emiAmount: number,
    monthlyInterest: number,
    extraAmountPaid: number,
    openingBalance: number
  ): number {
    const rawReduced = Math.max(0, emiAmount - monthlyInterest + extraAmountPaid);
    return Math.min(openingBalance, rawReduced);
  }

  /**
   * Excel Formula:
   * Closing Balance = MAX(0, Opening Balance - Principal Reduced)
   */
  public static calculateClosingBalance(
    openingBalance: number,
    principalReduced: number
  ): number {
    const balance = openingBalance - principalReduced;
    return balance <= 0.00001 ? 0 : Math.max(0, balance);
  }

  /**
   * Generate the complete repayment schedule for a loan.
   * Preserves historical actual records and manual interest overrides.
   */
  public static generateSchedule(
    loan: Loan,
    options?: {
      overrideExtraPayments?: ExtraPayment[];
      overrideRateHistory?: RateRevision[];
      maxMonths?: number;
      asOfDate?: string;
    }
  ): Installment[] {
    const maxMonths = options?.maxMonths ?? 360; // Max 30 years safety bound
    const rateHistory = options?.overrideRateHistory ?? loan.rateHistory ?? [];
    const extraPayments = options?.overrideExtraPayments ?? loan.extraPayments ?? [];
    const historicalInstallments = loan.historicalInstallments ?? [];

    const schedule: Installment[] = [];

    // Map historical installments by date or installmentNumber for fast lookup
    const historyByDate = new Map<string, Installment>();
    historicalInstallments.forEach((inst) => {
      historyByDate.set(inst.date, inst);
    });

    let currentBalance = loan.initialOpeningBalance;
    let currentDate = loan.startDate;
    let installmentNumber = 1;

    // In loans with 0 initial balance (already closed loans like Fullerton P loan)
    if (currentBalance <= 0 && historicalInstallments.length === 0) {
      return [];
    }

    while (currentBalance > 0 && installmentNumber <= maxMonths) {
      const historical = historyByDate.get(currentDate);

      // Check if there are extra payments for this date/period
      const matchingExtra = extraPayments
        .filter(
          (ep) =>
            ep.installmentDate === currentDate ||
            ep.date === currentDate ||
            ep.date.substring(0, 7) === currentDate.substring(0, 7) ||
            (installmentNumber === 1 && ep.date < loan.startDate)
        )
        .reduce((sum, ep) => sum + ep.amount, 0);

      // 1. Opening Balance:
      // Installment 1 starts with loan.initialOpeningBalance.
      // Every subsequent installment strictly starts from previous row's closing balance (currentBalance).
      const openingBalance = installmentNumber === 1 ? loan.initialOpeningBalance : currentBalance;

      // 2. Applicable Annual Interest Rate
      const annualRate = historical && historical.annualInterestRate !== undefined
        ? historical.annualInterestRate
        : this.getApplicableRate(rateHistory, loan.currentInterestRate, currentDate);

      // 3. Monthly Interest (Preserve manual interest override if historical)
      let monthlyInterest: number;
      if (historical && historical.isManualInterest) {
        monthlyInterest = historical.monthlyInterest;
      } else {
        monthlyInterest = this.calculateMonthlyInterest(openingBalance, annualRate);
      }

      // 4. Scheduled EMI
      const scheduledEmi = historical ? historical.scheduledEmi : loan.baseEmi;

      // 5. Extra Payment (Prevent double counting if already present in historical row)
      let extraAmountPaid: number;
      if (historical) {
        if (matchingExtra > 0 && historical.extraAmountPaid > 0) {
          extraAmountPaid = Math.max(historical.extraAmountPaid, matchingExtra);
        } else if (matchingExtra > 0) {
          extraAmountPaid = matchingExtra;
        } else {
          extraAmountPaid = historical.extraAmountPaid;
        }
      } else {
        extraAmountPaid = matchingExtra;
      }

      // 6. Principal Reduced
      const principalReduced = this.calculatePrincipalReduced(
        scheduledEmi,
        monthlyInterest,
        extraAmountPaid,
        openingBalance
      );

      // 7. Closing Balance
      const closingBalance = this.calculateClosingBalance(openingBalance, principalReduced);

      const installment: Installment = {
        id: historical?.id ?? `${loan.id}-inst-${installmentNumber}`,
        loanId: loan.id,
        installmentNumber,
        date: currentDate,
        openingBalance,
        annualInterestRate: annualRate,
        monthlyInterest,
        isManualInterest: historical?.isManualInterest,
        scheduledEmi,
        actualEmiPaid: historical?.actualEmiPaid ?? (historical?.paidStatus === 'Yes' ? scheduledEmi : 0),
        paidStatus: historical?.paidStatus ?? 'No',
        extraAmountPaid,
        principalReduced,
        closingBalance,
        isProjected: !historical,
        note: historical?.note,
      };

      schedule.push(installment);

      if (closingBalance <= 0) {
        break;
      }

      currentBalance = closingBalance;
      currentDate = addMonths(currentDate, 1);
      installmentNumber++;
    }

    return schedule;
  }

  /**
   * Calculate summary metrics for an individual loan
   */
  public static calculateLoanSummary(
    loan: Loan,
    currentDateStr: string = '2026-10-18'
  ): LoanSummary {
    const schedule = this.generateSchedule(loan);

    // If loan is marked closed and has 0 balance
    if (loan.status === 'closed' && schedule.length === 0) {
      return {
        loan,
        currentOutstandingPrincipal: 0,
        originalPrincipal: loan.originalPrincipal,
        principalRepaid: loan.originalPrincipal,
        currentRate: loan.currentInterestRate,
        monthlyEmi: 0,
        totalExtraPaid: loan.extraPayments.reduce((s, e) => s + e.amount, 0),
        totalInterestPaid: 0,
        totalCashPaid: loan.originalPrincipal,
        estimatedClosureDate: loan.startDate,
        remainingTenureMonths: 0,
        repaymentProgressPercent: 100,
        status: 'closed',
      };
    }

    // Find current outstanding balance as of currentDateStr
    // Following Master sheet behavior: Find installment matching current year-month
    const currentYearMonth = currentDateStr.substring(0, 7);
    let currentOutstanding = 0;
    let foundCurrentMonth = false;

    for (const inst of schedule) {
      if (inst.date.substring(0, 7) === currentYearMonth) {
        if (inst.paidStatus === 'Yes') {
          currentOutstanding = inst.closingBalance;
        } else {
          currentOutstanding = Math.max(0, inst.openingBalance - inst.extraAmountPaid);
        }
        foundCurrentMonth = true;
        break;
      }
    }

    // If current month is after the loan's closure
    if (!foundCurrentMonth) {
      const lastInst = schedule[schedule.length - 1];
      if (lastInst && currentDateStr > lastInst.date) {
        currentOutstanding = 0;
      } else {
        currentOutstanding = schedule[0]?.openingBalance ?? loan.initialOpeningBalance;
      }
    }

    if (loan.status === 'closed') {
      currentOutstanding = 0;
    }

    const principalRepaid = Math.max(0, loan.originalPrincipal - currentOutstanding);

    // Total extra paid from extraPayments and schedule
    const totalExtraPaid = schedule.reduce((sum, inst) => sum + inst.extraAmountPaid, 0);

    // Total interest paid so far (from installments up to current date)
    const pastInstallments = schedule.filter((inst) => inst.date <= currentDateStr);
    const futureInstallments = schedule.filter((inst) => inst.date > currentDateStr);

    const totalInterestPaid = pastInstallments.reduce((sum, inst) => sum + inst.monthlyInterest, 0);
    const totalCashPaid = pastInstallments.reduce(
      (sum, inst) => sum + inst.scheduledEmi + inst.extraAmountPaid,
      0
    );

    // Estimated closure date
    const lastInstallment = schedule[schedule.length - 1];
    let estimatedClosureDate: string | null = null;
    if (lastInstallment) {
      estimatedClosureDate = lastInstallment.closingBalance === 0 ? lastInstallment.date : null;
    }

    // Remaining tenure months
    const remainingTenureMonths = currentOutstanding > 0 ? futureInstallments.length : 0;

    // Repayment progress percentage
    const repaymentProgressPercent =
      loan.originalPrincipal > 0
        ? Math.min(100, Math.max(0, (principalRepaid / loan.originalPrincipal) * 100))
        : 100;

    return {
      loan,
      currentOutstandingPrincipal: currentOutstanding,
      originalPrincipal: loan.originalPrincipal,
      principalRepaid,
      currentRate: this.getApplicableRate(loan.rateHistory, loan.currentInterestRate, currentDateStr),
      monthlyEmi: currentOutstanding > 0 ? loan.baseEmi : 0,
      totalExtraPaid,
      totalInterestPaid,
      totalCashPaid,
      estimatedClosureDate,
      remainingTenureMonths,
      repaymentProgressPercent,
      status: currentOutstanding === 0 ? 'closed' : loan.status,
    };
  }

  /**
   * Derive master dashboard summary across all loans
   */
  public static calculateMasterSummary(
    loans: Loan[],
    currentDateStr: string = '2026-10-18'
  ): MasterDashboardSummary {
    const loanSummaries = loans.map((loan) => this.calculateLoanSummary(loan, currentDateStr));

    let totalOutstanding = 0;
    let totalOriginal = 0;
    let totalRepaid = 0;
    let totalEmi = 0;
    let totalExtra = 0;
    let activeLoans = 0;
    let closedLoans = 0;
    let latestClosureDate: string | null = null;

    for (const summary of loanSummaries) {
      totalOutstanding += summary.currentOutstandingPrincipal;
      totalOriginal += summary.originalPrincipal;
      totalRepaid += summary.principalRepaid;
      totalExtra += summary.totalExtraPaid;

      if (summary.status === 'active' && summary.currentOutstandingPrincipal > 0) {
        totalEmi += summary.monthlyEmi;
        activeLoans++;
        if (summary.estimatedClosureDate) {
          if (!latestClosureDate || summary.estimatedClosureDate > latestClosureDate) {
            latestClosureDate = summary.estimatedClosureDate;
          }
        }
      } else {
        closedLoans++;
      }
    }

    const overallProgress =
      totalOriginal > 0 ? Math.min(100, (totalRepaid / totalOriginal) * 100) : 100;

    return {
      totalOutstandingPrincipal: totalOutstanding,
      totalOriginalPrincipal: totalOriginal,
      totalPrincipalRepaid: totalRepaid,
      totalMonthlyEmiCommitment: totalEmi,
      totalExtraPrincipalPaid: totalExtra,
      estimatedDebtFreeDate: latestClosureDate,
      overallProgressPercent: overallProgress,
      activeLoanCount: activeLoans,
      closedLoanCount: closedLoans,
      loanSummaries,
    };
  }

  /**
   * Calculate the before-and-after impact of an extra principal payment
   */
  public static calculateExtraPaymentImpact(
    loan: Loan,
    extraAmount: number,
    paymentDate: string,
    excludePaymentId?: string
  ): ExtraPaymentImpact {
    const paymentYearMonth = paymentDate.substring(0, 7);

    // Baseline extra payments: all extra payments excluding the one being edited/added
    const baseExtraPayments = excludePaymentId
      ? (loan.extraPayments || []).filter((ep) => ep.id !== excludePaymentId)
      : (loan.extraPayments || []);

    // 1. Baseline Schedule (without this extra payment)
    const baselineSchedule = this.generateSchedule(loan, {
      overrideExtraPayments: baseExtraPayments,
    });
    const baselineRemaining = baselineSchedule.filter(
      (inst) => inst.date.substring(0, 7) >= paymentYearMonth
    );
    const baselineTotalInterest = baselineRemaining.reduce(
      (sum, inst) => sum + inst.monthlyInterest,
      0
    );
    const baselineClosureDate =
      baselineSchedule.length > 0 ? baselineSchedule[baselineSchedule.length - 1].date : null;

    // 2. Updated Schedule (with this extra payment added)
    const newExtraPayment: ExtraPayment = {
      id: excludePaymentId || `sim-${Date.now()}`,
      amount: extraAmount,
      date: paymentDate,
    };

    const updatedSchedule = this.generateSchedule(loan, {
      overrideExtraPayments: [...baseExtraPayments, newExtraPayment],
    });

    const updatedRemaining = updatedSchedule.filter(
      (inst) => inst.date.substring(0, 7) >= paymentYearMonth
    );
    const updatedTotalInterest = updatedRemaining.reduce(
      (sum, inst) => sum + inst.monthlyInterest,
      0
    );
    const updatedClosureDate =
      updatedSchedule.length > 0 ? updatedSchedule[updatedSchedule.length - 1].date : null;

    // Find installment on payment month in updated schedule to get new balance
    const updatedInstAtMonth = updatedSchedule.find(
      (inst) => inst.date.substring(0, 7) === paymentYearMonth
    );
    const newBalance = updatedInstAtMonth
      ? updatedInstAtMonth.closingBalance
      : (updatedSchedule[updatedSchedule.length - 1]?.closingBalance ?? 0);

    const interestSaved = Math.max(0, baselineTotalInterest - updatedTotalInterest);
    const monthsReduced = Math.max(0, baselineSchedule.length - updatedSchedule.length);

    return {
      loanId: loan.id,
      loanName: loan.name,
      extraAmount,
      paymentDate,
      baseline: {
        closureDate: baselineClosureDate,
        totalInterest: baselineTotalInterest,
        remainingMonths: baselineRemaining.length,
      },
      updated: {
        closureDate: updatedClosureDate,
        totalInterest: updatedTotalInterest,
        remainingMonths: updatedRemaining.length,
      },
      savings: {
        interestSaved,
        monthsReduced,
        newBalance,
      },
    };
  }
}
