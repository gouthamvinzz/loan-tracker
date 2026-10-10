import React from 'react';
import { MasterDashboardSummary } from '../../types/loan';
import { formatINR } from '../../utils/formatters';
import { CheckCircle2, Zap, Calendar, Plus, Sparkles, TrendingDown } from 'lucide-react';

interface DebtProgressVisualProps {
  summary: MasterDashboardSummary;
  onOpenAddLoan: () => void;
}

export const DebtProgressVisual: React.FC<DebtProgressVisualProps> = ({
  summary,
  onOpenAddLoan,
}) => {
  const percent = Math.min(100, Math.max(0, summary.overallProgressPercent));

  return (
    <div className="debt-progress-banner">
      <div className="debt-progress-top">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="debt-progress-badge">
              <Sparkles size={13} />
              Portfolio Overview
            </span>
            <span className="badge badge-active" style={{ fontSize: 11 }}>
              {summary.activeLoanCount} Active Loans
            </span>
            <span className="badge badge-closed" style={{ fontSize: 11 }}>
              {summary.closedLoanCount} Paid Off
            </span>
          </div>
          <div className="debt-progress-label">Total Portfolio Debt Remaining</div>
          <div className="debt-progress-main-number">
            {formatINR(summary.totalOutstandingPrincipal)}
          </div>
        </div>

        <div className="debt-progress-right">
          <div className="debt-progress-percentage-pill">
            <TrendingDown size={20} />
            <span>{percent.toFixed(1)}%</span>
          </div>
          <div className="debt-progress-percent-subtext">
            of total portfolio debt cleared
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="debt-progress-track-wrapper">
        <div className="debt-progress-track">
          <div
            className="debt-progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="debt-progress-track-labels">
          <span>₹0</span>
          <span style={{ fontWeight: 700, color: 'var(--success-text)' }}>
            {percent.toFixed(1)}% Cleared
          </span>
          <span>Original Borrowed: {formatINR(summary.totalOriginalPrincipal)}</span>
        </div>
      </div>

      {/* Stats Breakdown Bar */}
      <div className="debt-progress-stats">
        <div className="stat-pill-item">
          <div className="stat-pill-icon icon-emerald">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="stat-item-label">Principal Cleared</div>
            <div className="stat-item-val" style={{ color: '#059669' }}>
              {formatINR(summary.totalPrincipalRepaid)}
            </div>
          </div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-icon icon-purple">
            <Zap size={18} />
          </div>
          <div>
            <div className="stat-item-label">Extra Prepayments</div>
            <div className="stat-item-val" style={{ color: '#7c3aed' }}>
              {formatINR(summary.totalExtraPrincipalPaid)}
            </div>
          </div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-icon icon-sky">
            <Calendar size={18} />
          </div>
          <div>
            <div className="stat-item-label">Monthly EMI Outflow</div>
            <div className="stat-item-val" style={{ color: '#0284c7' }}>
              {formatINR(summary.totalMonthlyEmiCommitment)}<span style={{ fontSize: 13, fontWeight: 500 }}>/mo</span>
            </div>
          </div>
        </div>

        <div className="stat-action-wrap">
          <button className="btn btn-primary" onClick={onOpenAddLoan}>
            <Plus size={16} />
            <span>Add New Loan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
