import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Database,
  CheckCircle2,
  FileSpreadsheet,
  X,
  CreditCard,
} from 'lucide-react';
import { MasterDashboardSummary } from '../../types/loan';
import { formatINR, formatDisplayDate } from '../../utils/formatters';

interface SidebarProps {
  summary: MasterDashboardSummary;
  selectedLoanId: string | null;
  onSelectLoan: (loanId: string | null) => void;
  onOpenAddLoan: () => void;
  onOpenBackup: () => void;
  onExportExcel: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  summary,
  selectedLoanId,
  onSelectLoan,
  onOpenAddLoan,
  onOpenBackup,
  onExportExcel,
  isOpen,
  onCloseMobile,
}) => {
  const activeLoans = summary.loanSummaries.filter((s) => s.status === 'active');
  const closedLoans = summary.loanSummaries.filter((s) => s.status === 'closed');

  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35, display: 'none' }}
          onClick={onCloseMobile}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <CreditCard size={20} />
          </div>
          <div className="sidebar-title-wrap">
            <span className="sidebar-title">LoanPay</span>
            <span className="sidebar-subtitle">Personal Debt Tracker</span>
          </div>
          <button
            className="modal-close-btn mobile-menu-btn"
            style={{ marginLeft: 'auto' }}
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Compact Overall Debt Summary in Sidebar */}
        <div className="sidebar-debt-summary">
          <div className="sidebar-debt-label">Total Outstanding</div>
          <div className="sidebar-debt-val">
            {formatINR(summary.totalOutstandingPrincipal)}
          </div>
          <div className="sidebar-debt-progress-wrap">
            <div className="sidebar-debt-bar">
              <div
                className="sidebar-debt-bar-fill"
                style={{ width: `${Math.min(100, summary.overallProgressPercent)}%` }}
              />
            </div>
            <div className="sidebar-debt-subtext">
              <span>{summary.overallProgressPercent.toFixed(1)}% Repaid</span>
              <span>
                {summary.estimatedDebtFreeDate
                  ? formatDisplayDate(summary.estimatedDebtFreeDate).split(' ').slice(1).join(' ')
                  : 'Debt-Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="sidebar-nav">
          <div
            className={`nav-item ${selectedLoanId === null ? 'active' : ''}`}
            onClick={() => {
              onSelectLoan(null);
              onCloseMobile();
            }}
          >
            <LayoutDashboard size={18} />
            <span>Master Dashboard</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 12px 6px 12px',
            }}
          >
            <span className="sidebar-section-title" style={{ padding: 0 }}>
              Active Loans ({activeLoans.length})
            </span>
            <button
              onClick={onOpenAddLoan}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11.5,
                fontWeight: 600,
              }}
              title="Add New Loan"
            >
              <PlusCircle size={14} />
              <span>Add</span>
            </button>
          </div>

          {activeLoans.map((s) => (
            <div
              key={s.loan.id}
              className={`nav-item ${selectedLoanId === s.loan.id ? 'active' : ''}`}
              onClick={() => {
                onSelectLoan(s.loan.id);
                onCloseMobile();
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.loan.name}
              </span>
              <span className="nav-item-badge">
                {formatINR(s.currentOutstandingPrincipal)}
              </span>
            </div>
          ))}

          {closedLoans.length > 0 && (
            <>
              <div className="sidebar-section-title">
                Closed Loans ({closedLoans.length})
              </div>
              {closedLoans.map((s) => (
                <div
                  key={s.loan.id}
                  className={`nav-item ${selectedLoanId === s.loan.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectLoan(s.loan.id);
                    onCloseMobile();
                  }}
                  style={{ opacity: 0.8 }}
                >
                  <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.loan.name}
                  </span>
                  <span
                    className="nav-item-badge"
                    style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
                  >
                    Paid
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-sm" onClick={onExportExcel}>
            <FileSpreadsheet size={15} />
            <span>Export to Excel</span>
          </button>
          <button className="btn btn-subtle btn-sm" onClick={onOpenBackup}>
            <Database size={15} />
            <span>Backup & Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
