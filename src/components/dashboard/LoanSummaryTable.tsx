import { useState } from 'react';
import { Plus, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { MasterDashboardSummary } from '../../types/loan';
import { formatINR, formatPercent, formatDisplayDate } from '../../utils/formatters';

interface LoanSummaryTableProps {
  summary: MasterDashboardSummary;
  onSelectLoan: (loanId: string) => void;
  onOpenAddLoan: () => void;
}

export const LoanSummaryTable: React.FC<LoanSummaryTableProps> = ({
  summary,
  onSelectLoan,
  onOpenAddLoan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  const filteredSummaries = summary.loanSummaries.filter((s) => {
    const matchesSearch =
      s.loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.loan.lender && s.loan.lender.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
            Loan Portfolio Summary
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Click on any loan row to view repayment schedules, interest history, or record payments
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: 200 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search loans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 32, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
            <button
              onClick={() => setStatusFilter('all')}
              className="btn btn-sm"
              style={{
                background: statusFilter === 'all' ? '#ffffff' : 'transparent',
                boxShadow: statusFilter === 'all' ? 'var(--shadow-sm)' : 'none',
                color: statusFilter === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              All ({summary.loanSummaries.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className="btn btn-sm"
              style={{
                background: statusFilter === 'active' ? '#ffffff' : 'transparent',
                boxShadow: statusFilter === 'active' ? 'var(--shadow-sm)' : 'none',
                color: statusFilter === 'active' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              Active ({summary.activeLoanCount})
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className="btn btn-sm"
              style={{
                background: statusFilter === 'closed' ? '#ffffff' : 'transparent',
                boxShadow: statusFilter === 'closed' ? 'var(--shadow-sm)' : 'none',
                color: statusFilter === 'closed' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              Closed ({summary.closedLoanCount})
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onOpenAddLoan}>
            <Plus size={15} />
            <span>Add Loan</span>
          </button>
        </div>
      </div>

      <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Loan Name & Lender</th>
              <th style={{ textAlign: 'right' }}>Outstanding Principal</th>
              <th style={{ textAlign: 'center' }}>Interest Rate</th>
              <th style={{ textAlign: 'right' }}>Monthly EMI</th>
              <th style={{ textAlign: 'right' }}>Extra Paid</th>
              <th style={{ textAlign: 'center' }}>Estimated Closure</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredSummaries.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No loans found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredSummaries.map((s) => {
                const isClosed = s.status === 'closed';
                return (
                  <tr
                    key={s.loan.id}
                    onClick={() => onSelectLoan(s.loan.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isClosed ? 'var(--bg-subtle)' : 'var(--bg-accent-subtle)',
                            color: isClosed ? 'var(--text-muted)' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {s.loan.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>
                            {s.loan.name}
                          </div>
                          {s.loan.lender && (
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {s.loan.lender}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Outstanding Principal */}
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      <span style={{ color: isClosed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {formatINR(s.currentOutstandingPrincipal)}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                        Orig: {formatINR(s.originalPrincipal)}
                      </div>
                    </td>

                    {/* Rate */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-blue">
                        {s.currentRate > 0 ? formatPercent(s.currentRate) : '0% (Interest-Free)'}
                      </span>
                    </td>

                    {/* Monthly EMI */}
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {s.monthlyEmi > 0 ? (
                        <>
                          {formatINR(s.monthlyEmi)}
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Extra Paid */}
                    <td style={{ textAlign: 'right', color: s.totalExtraPaid > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {s.totalExtraPaid > 0 ? formatINR(s.totalExtraPaid) : '—'}
                    </td>

                    {/* Estimated Closure Date */}
                    <td style={{ textAlign: 'center', fontSize: 13 }}>
                      {isClosed ? (
                        <span style={{ color: 'var(--success-text)', fontWeight: 500 }}>
                          Paid Off
                        </span>
                      ) : s.estimatedClosureDate ? (
                        formatDisplayDate(s.estimatedClosureDate)
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      {isClosed ? (
                        <span className="badge badge-closed">
                          <CheckCircle2 size={12} />
                          Closed
                        </span>
                      ) : (
                        <span className="badge badge-active">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Action Arrow */}
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ChevronRight size={18} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
