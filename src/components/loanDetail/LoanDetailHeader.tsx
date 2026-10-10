import React from 'react';
import {
  CreditCard,
  Coins,
  CheckCircle2,
  Zap,
  Edit2,
} from 'lucide-react';
import { LoanSummary } from '../../types/loan';
import { formatINR, formatPercent, formatDisplayDate } from '../../utils/formatters';

interface LoanDetailHeaderProps {
  summary: LoanSummary;
  onRecordPayment: () => void;
  onAddExtraPayment: () => void;
  onEditLoan: () => void;
}

export const LoanDetailHeader: React.FC<LoanDetailHeaderProps> = ({
  summary,
  onRecordPayment,
  onAddExtraPayment,
  onEditLoan,
}) => {
  const { loan } = summary;
  const isClosed = summary.status === 'closed';
  const progress = Math.min(100, Math.max(0, summary.repaymentProgressPercent));

  return (
    <div className="card" style={{ marginBottom: 24, padding: 28 }}>
      {/* Top row: Title, Lender, Status, Edit, Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isClosed ? 'var(--bg-subtle)' : 'var(--bg-accent-subtle)',
              color: isClosed ? 'var(--text-muted)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {loan.name}
              </h1>
              {isClosed ? (
                <span className="badge badge-closed">
                  <CheckCircle2 size={12} />
                  Closed / Paid Off
                </span>
              ) : (
                <span className="badge badge-active">Active Loan</span>
              )}
              <button
                onClick={onEditLoan}
                className="btn btn-subtle btn-sm"
                style={{ padding: '4px 8px', fontSize: 12 }}
                title="Edit Loan Details"
              >
                <Edit2 size={12} />
                <span>Edit</span>
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {loan.lender || 'Personal Loan'} • Started {formatDisplayDate(loan.startDate)}
              {loan.notes && ` • ${loan.notes}`}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isClosed && (
            <button className="btn btn-secondary" onClick={onRecordPayment}>
              <Coins size={16} />
              <span>Record Payment</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={onAddExtraPayment}>
            <Zap size={16} />
            <span>Add Extra Payment</span>
          </button>
        </div>
      </div>

      {/* Repayment Progress Bar (Inspired by User Screenshot!) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Loan Repayment Progress
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--success-text)' }}>
            {progress.toFixed(1)}% Repaid
          </span>
        </div>
        <div className="debt-progress-track" style={{ height: 10, marginBottom: 0 }}>
          <div className="debt-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Grid of 8 Detailed Metrics */}
      <div className="loan-metrics-grid">
        {/* Outstanding */}
        <div className="loan-stat-card card-theme-debt">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-rose" style={{ margin: 0 }}>
              Balance Due
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Original: {formatINR(summary.originalPrincipal)}
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {formatINR(summary.currentOutstandingPrincipal)}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Remaining balance to clear
          </div>
        </div>

        {/* Principal Repaid */}
        <div className="loan-stat-card card-theme-cleared">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-emerald" style={{ margin: 0 }}>
              Repaid
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success-text)' }}>
              {progress.toFixed(1)}% cleared
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', margin: '4px 0' }}>
            {formatINR(summary.principalRepaid)}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Principal paid down so far
          </div>
        </div>

        {/* Current Interest Rate */}
        <div className="loan-stat-card card-theme-sky">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-sky" style={{ margin: 0 }}>
              Interest Rate
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {summary.currentRate > 0 ? 'Per Annum' : '0% Interest'}
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7', margin: '4px 0' }}>
            {summary.currentRate > 0 ? formatPercent(summary.currentRate) : '0%'}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Current active bank rate
          </div>
        </div>

        {/* Monthly Base EMI */}
        <div className="loan-stat-card card-theme-sky">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-sky" style={{ margin: 0 }}>
              Monthly EMI
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Due on {loan.repaymentDay}th
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {summary.monthlyEmi > 0 ? formatINR(summary.monthlyEmi) : '₹0'}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Monthly scheduled payment
          </div>
        </div>

        {/* Total Extra Payments */}
        <div className="loan-stat-card card-theme-extra">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-purple" style={{ margin: 0 }}>
              Prepayments
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Tenure Saver
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>
            {formatINR(summary.totalExtraPaid)}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Direct principal reductions
          </div>
        </div>

        {/* Total Interest Paid */}
        <div className="loan-stat-card card-theme-borrowed">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-slate" style={{ margin: 0 }}>
              Interest Paid
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Cost of Loan
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#334155', margin: '4px 0' }}>
            {formatINR(summary.totalInterestPaid)}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Cumulative interest paid
          </div>
        </div>

        {/* Payoff Date */}
        <div className="loan-stat-card card-theme-freedom">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-amber" style={{ margin: 0 }}>
              Target Payoff
            </span>
            <span style={{ fontSize: 11, color: '#b45309' }}>
              {summary.remainingTenureMonths > 0 ? `${summary.remainingTenureMonths} mo left` : 'Closed'}
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
            {isClosed
              ? 'Paid Off'
              : summary.estimatedClosureDate
              ? formatDisplayDate(summary.estimatedClosureDate)
              : '—'}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Projected loan closure
          </div>
        </div>

        {/* Total Cash Paid */}
        <div className="loan-stat-card card-theme-borrowed">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="metric-category-tag tag-slate" style={{ margin: 0 }}>
              Total Outflow
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              All-Time Cash
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {formatINR(summary.totalCashPaid)}
          </div>
          <div className="metric-subtext" style={{ fontSize: 11.5 }}>
            Total cash disbursed so far
          </div>
        </div>
      </div>
    </div>
  );
};
