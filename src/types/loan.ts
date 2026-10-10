export type LoanStatus = 'active' | 'closed';

export interface RateRevision {
  id: string;
  rate: number; // Annual interest rate percentage, e.g. 10.2 for 10.2%
  effectiveDate: string; // YYYY-MM-DD
  note?: string;
  createdAt?: string;
}

export interface ExtraPayment {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  installmentDate?: string;
  createdAt?: string;
}

export interface Installment {
  id: string;
  loanId: string;
  installmentNumber: number;
  date: string; // YYYY-MM-DD
  openingBalance: number;
  annualInterestRate: number; // e.g. 10.2 for 10.2%
  monthlyInterest: number;
  isManualInterest?: boolean; // True if manually entered override from historical spreadsheet
  scheduledEmi: number;
  actualEmiPaid: number;
  paidStatus: 'Yes' | 'No';
  extraAmountPaid: number;
  principalReduced: number;
  closingBalance: number;
  isProjected: boolean; // false for historical recorded installments, true for future projections
  note?: string;
}

export interface Loan {
  id: string;
  name: string;
  lender?: string;
  originalPrincipal: number; // Starting principal (sanctioned amount or original loan total)
  initialOpeningBalance: number; // Opening balance at start of schedule
  currentInterestRate: number; // Current active annual interest rate percentage
  baseEmi: number; // Scheduled regular monthly EMI
  startDate: string; // YYYY-MM-DD
  repaymentDay: number; // 1-31
  status: LoanStatus;
  notes?: string;
  rateHistory: RateRevision[];
  extraPayments: ExtraPayment[];
  // Historical recorded installments imported from Excel or manually marked
  historicalInstallments?: Installment[];
}

export interface LoanSummary {
  loan: Loan;
  currentOutstandingPrincipal: number; // As of current month
  originalPrincipal: number;
  principalRepaid: number;
  currentRate: number;
  monthlyEmi: number;
  totalExtraPaid: number;
  totalInterestPaid: number;
  totalCashPaid: number;
  estimatedClosureDate: string | null;
  remainingTenureMonths: number;
  repaymentProgressPercent: number;
  status: LoanStatus;
}

export interface MasterDashboardSummary {
  totalOutstandingPrincipal: number;
  totalOriginalPrincipal: number;
  totalPrincipalRepaid: number;
  totalMonthlyEmiCommitment: number;
  totalExtraPrincipalPaid: number;
  estimatedDebtFreeDate: string | null;
  overallProgressPercent: number;
  activeLoanCount: number;
  closedLoanCount: number;
  loanSummaries: LoanSummary[];
}

export interface ExtraPaymentImpact {
  loanId: string;
  loanName: string;
  extraAmount: number;
  paymentDate: string;
  baseline: {
    closureDate: string | null;
    totalInterest: number;
    remainingMonths: number;
  };
  updated: {
    closureDate: string | null;
    totalInterest: number;
    remainingMonths: number;
  };
  savings: {
    interestSaved: number;
    monthsReduced: number;
    newBalance: number;
  };
}
