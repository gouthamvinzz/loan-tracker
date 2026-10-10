import { Loan, ExtraPayment, Installment } from '../../types/loan';
import { LoanDetailHeader } from './LoanDetailHeader';
import { RateHistoryCard } from './RateHistoryCard';
import { RepaymentScheduleTable } from './RepaymentScheduleTable';
import { PaymentHistoryCard } from './PaymentHistoryCard';
import { FinancialEngine } from '../../services/financialEngine';

interface LoanDetailViewProps {
  loan: Loan;
  onRecordPayment: () => void;
  onAddExtraPayment: () => void;
  onEditLoan: () => void;
  onOpenAddRateChange: () => void;
  onEditExtraPayment: (payment: ExtraPayment) => void;
  onDeleteExtraPayment: (paymentId: string) => void;
  onTogglePaidStatus: (installment: Installment) => void;
}

export const LoanDetailView: React.FC<LoanDetailViewProps> = ({
  loan,
  onRecordPayment,
  onAddExtraPayment,
  onEditLoan,
  onOpenAddRateChange,
  onEditExtraPayment,
  onDeleteExtraPayment,
  onTogglePaidStatus,
}) => {
  const summary = FinancialEngine.calculateLoanSummary(loan);
  const schedule = FinancialEngine.generateSchedule(loan);

  return (
    <div>
      <LoanDetailHeader
        summary={summary}
        onRecordPayment={onRecordPayment}
        onAddExtraPayment={onAddExtraPayment}
        onEditLoan={onEditLoan}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        <RateHistoryCard
          loan={loan}
          onOpenAddRateChange={onOpenAddRateChange}
        />

        <PaymentHistoryCard
          loan={loan}
          onEditExtraPayment={onEditExtraPayment}
          onDeleteExtraPayment={onDeleteExtraPayment}
          onAddExtraPayment={onAddExtraPayment}
        />
      </div>

      <RepaymentScheduleTable
        schedule={schedule}
        onTogglePaidStatus={onTogglePaidStatus}
      />
    </div>
  );
};
