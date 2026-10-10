import React from 'react';
import { MasterDashboardSummary } from '../../types/loan';
import { SummaryCards } from './SummaryCards';
import { DebtProgressVisual } from './DebtProgressVisual';
import { DebtTrajectoryChart } from './DebtTrajectoryChart';
import { LoanComparisonChart } from './LoanComparisonChart';
import { LoanSummaryTable } from './LoanSummaryTable';

interface MasterDashboardViewProps {
  summary: MasterDashboardSummary;
  onSelectLoan: (loanId: string) => void;
  onOpenAddLoan: () => void;
}

export const MasterDashboardView: React.FC<MasterDashboardViewProps> = ({
  summary,
  onSelectLoan,
  onOpenAddLoan,
}) => {
  return (
    <div>
      {/* 6 Key Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Debt Progress Banner */}
      <DebtProgressVisual
        summary={summary}
        onOpenAddLoan={onOpenAddLoan}
      />

      {/* Charts Grid */}
      <div className="charts-grid">
        <DebtTrajectoryChart summary={summary} />
        <LoanComparisonChart summary={summary} />
      </div>

      {/* Master Loan Summary Table */}
      <LoanSummaryTable
        summary={summary}
        onSelectLoan={onSelectLoan}
        onOpenAddLoan={onOpenAddLoan}
      />
    </div>
  );
};
