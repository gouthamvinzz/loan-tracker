import React from 'react';
import {
  Coins,
  BadgeIndianRupee,
  TrendingDown,
  CalendarCheck,
  Zap,
  PiggyBank,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { MasterDashboardSummary } from '../../types/loan';
import { formatINR, formatDisplayDate } from '../../utils/formatters';

interface SummaryCardsProps {
  summary: MasterDashboardSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const remainingPercent = summary.totalOriginalPrincipal > 0
    ? (summary.totalOutstandingPrincipal / summary.totalOriginalPrincipal) * 100
    : 0;

  return (
    <div className="metrics-grid">
      {/* 1. Outstanding Principal (Current Debt) - Red/Rose Theme */}
      <div className="metric-card card-theme-debt">
        <div className="metric-header">
          <div>
            <span className="metric-category-tag tag-rose">
              <span className="tag-dot dot-rose"></span>
              Current Debt
            </span>
            <h3 className="metric-title">Outstanding Principal</h3>
          </div>
          <div className="metric-icon-wrap icon-rose">
            <Coins size={22} />
          </div>
        </div>

        <div className="metric-value-wrap">
          <div className="metric-value value-debt">
            {formatINR(summary.totalOutstandingPrincipal)}
          </div>
        </div>

        <div className="metric-footer">
          <div className="metric-pill pill-rose">
            <span>{remainingPercent.toFixed(1)}% Remaining</span>
          </div>
          <span className="metric-helper-text">
            Active balance to be cleared
          </span>
        </div>
      </div>

      {/* 2. Principal Repaid - Emerald Green Theme */}
      <div className="metric-card card-theme-cleared">
        <div className="metric-header">
          <div>
            <span className="metric-category-tag tag-emerald">
              <CheckCircle2 size={12} />
              Debt Cleared
            </span>
            <h3 className="metric-title">Principal Repaid</h3>
          </div>
          <div className="metric-icon-wrap icon-emerald">
            <TrendingDown size={22} />
          </div>
        </div>

        <div className="metric-value-wrap">
          <div className="metric-value value-cleared">
            {formatINR(summary.totalPrincipalRepaid)}
          </div>
        </div>

        <div className="metric-footer">
          <div className="metric-pill pill-emerald">
            <span>{summary.overallProgressPercent.toFixed(1)}% Conquered</span>
          </div>
          <span className="metric-helper-text">
            Permanently knocked off debt
          </span>
        </div>
      </div>

      {/* 3. Estimated Debt-Free Date - Amber/Gold Theme */}
      <div className="metric-card card-theme-freedom">
        <div className="metric-header">
          <div>
            <span className="metric-category-tag tag-amber">
              <CalendarCheck size={12} />
              Freedom Target
            </span>
            <h3 className="metric-title">Estimated Debt-Free</h3>
          </div>
          <div className="metric-icon-wrap icon-amber">
            <Clock size={22} />
          </div>
        </div>

        <div className="metric-value-wrap">
          <div className="metric-value value-freedom">
            {summary.estimatedDebtFreeDate
              ? formatDisplayDate(summary.estimatedDebtFreeDate)
              : 'Debt-Free! 🎉'}
          </div>
        </div>

        <div className="metric-footer">
          <div className="metric-pill pill-amber">
            <span>Final Milestone</span>
          </div>
          <span className="metric-helper-text">
            {summary.estimatedDebtFreeDate ? 'Projected completion date' : 'All loans cleared'}
          </span>
        </div>
      </div>

      {/* 4. Monthly EMI Commitment - Sky Blue Theme */}
      <div className="metric-card card-theme-emi">
        <div className="metric-header">
          <div>
            <span className="metric-category-tag tag-sky">
              <ArrowUpRight size={12} />
              Monthly Outflow
            </span>
            <h3 className="metric-title">Monthly EMI Commitment</h3>
          </div>
          <div className="metric-icon-wrap icon-sky">
            <PiggyBank size={22} />
          </div>
        </div>

        <div className="metric-value-wrap">
          <div className="metric-value value-emi">
            {formatINR(summary.totalMonthlyEmiCommitment)}
            <span className="metric-unit">/mo</span>
          </div>
        </div>

        <div className="metric-footer">
          <div className="metric-pill pill-sky">
            <span>{summary.activeLoanCount} Active Accounts</span>
          </div>
          <span className="metric-helper-text">
            Recurring monthly cashflow
          </span>
        </div>
      </div>

      {/* 5. Extra Prepayments - Royal Purple Theme */}
      <div className="metric-card card-theme-extra">
        <div className="metric-header">
          <div>
            <span className="metric-category-tag tag-purple">
              <Zap size={12} />
              Prepayments
            </span>
            <h3 className="metric-title">Extra Prepayments Made</h3>
          </div>
          <div className="metric-icon-wrap icon-purple">
            <Flame size={22} />
          </div>
        </div>

        <div className="metric-value-wrap">
          <div className="metric-value value-extra">
            {formatINR(summary.totalExtraPrincipalPaid)}
          </div>
        </div>

        <div className="metric-footer">
          <div className="metric-pill pill-purple">
            <span>Interest Saver</span>
          </div>
          <span className="metric-helper-text">
            Direct lump sums reducing tenure
          </span>
        </div>
      </div>

      {/* 6. Total Original Principal - Steel Slate Theme */}
      <div className="metric-card card-theme-borrowed">
        <div className="metric-header">
          <div>
            <span className="metric-category-tag tag-slate">
              <BadgeIndianRupee size={12} />
              Total Borrowed
            </span>
            <h3 className="metric-title">Original Sanctioned Principal</h3>
          </div>
          <div className="metric-icon-wrap icon-slate">
            <BadgeIndianRupee size={22} />
          </div>
        </div>

        <div className="metric-value-wrap">
          <div className="metric-value value-borrowed">
            {formatINR(summary.totalOriginalPrincipal)}
          </div>
        </div>

        <div className="metric-footer">
          <div className="metric-pill pill-slate">
            <span>{summary.activeLoanCount + summary.closedLoanCount} Total Loans</span>
          </div>
          <span className="metric-helper-text">
            Starting baseline portfolio
          </span>
        </div>
      </div>
    </div>
  );
};
