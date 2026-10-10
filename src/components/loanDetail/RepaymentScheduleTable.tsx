import React, { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { Installment } from '../../types/loan';
import { formatINR, formatPercent, formatDisplayDate } from '../../utils/formatters';

interface RepaymentScheduleTableProps {
  schedule: Installment[];
  currentDateStr?: string;
  onTogglePaidStatus?: (installment: Installment) => void;
}

export const RepaymentScheduleTable: React.FC<RepaymentScheduleTableProps> = ({
  schedule,
  currentDateStr = '2026-10-18',
  onTogglePaidStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'past' | 'future' | 'extra'>('all');

  const filteredSchedule = schedule.filter((inst) => {
    // Search by date string (e.g. "2026", "Oct", "18")
    const matchesSearch =
      inst.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDisplayDate(inst.date).toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'past') {
      return inst.date <= currentDateStr;
    }
    if (filterMode === 'future') {
      return inst.date > currentDateStr;
    }
    if (filterMode === 'extra') {
      return inst.extraAmountPaid > 0;
    }
    return true;
  });

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
      {/* Header & Controls */}
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
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
            Complete Repayment Schedule
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Monthly interest and principal amortization calculated strictly using workbook formulas
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: 180 }}>
            <Search
              size={14}
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
              placeholder="Filter by date / year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 30, paddingTop: 6, paddingBottom: 6, fontSize: 13 }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
            <button
              onClick={() => setFilterMode('all')}
              className="btn btn-sm"
              style={{
                background: filterMode === 'all' ? '#ffffff' : 'transparent',
                boxShadow: filterMode === 'all' ? 'var(--shadow-sm)' : 'none',
                color: filterMode === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              All ({schedule.length})
            </button>
            <button
              onClick={() => setFilterMode('past')}
              className="btn btn-sm"
              style={{
                background: filterMode === 'past' ? '#ffffff' : 'transparent',
                boxShadow: filterMode === 'past' ? 'var(--shadow-sm)' : 'none',
                color: filterMode === 'past' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              Past / Recorded
            </button>
            <button
              onClick={() => setFilterMode('future')}
              className="btn btn-sm"
              style={{
                background: filterMode === 'future' ? '#ffffff' : 'transparent',
                boxShadow: filterMode === 'future' ? 'var(--shadow-sm)' : 'none',
                color: filterMode === 'future' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              Future Projections
            </button>
            <button
              onClick={() => setFilterMode('extra')}
              className="btn btn-sm"
              style={{
                background: filterMode === 'extra' ? '#ffffff' : 'transparent',
                boxShadow: filterMode === 'extra' ? 'var(--shadow-sm)' : 'none',
                color: filterMode === 'extra' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              Prepayments
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', maxHeight: 520 }}>
        <table className="data-table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>#</th>
              <th>Installment Date</th>
              <th style={{ textAlign: 'right' }}>Opening Balance</th>
              <th style={{ textAlign: 'center' }}>Rate</th>
              <th style={{ textAlign: 'right' }}>Monthly Interest</th>
              <th style={{ textAlign: 'right' }}>Scheduled EMI</th>
              <th style={{ textAlign: 'center' }}>Paid Status</th>
              <th style={{ textAlign: 'right' }}>Extra Prepayment</th>
              <th style={{ textAlign: 'right' }}>Principal Reduced</th>
              <th style={{ textAlign: 'right' }}>Closing Balance</th>
              <th style={{ textAlign: 'center' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedule.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                  No installments match the filter.
                </td>
              </tr>
            ) : (
              filteredSchedule.map((inst) => {
                const isCurrentMonth = inst.date.substring(0, 7) === currentDateStr.substring(0, 7);
                const hasExtra = inst.extraAmountPaid > 0;

                return (
                  <tr
                    key={inst.id}
                    style={{
                      backgroundColor: isCurrentMonth
                        ? '#f0fdf4'
                        : hasExtra
                        ? '#faf5ff'
                        : undefined,
                    }}
                  >
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                      {inst.installmentNumber}
                    </td>

                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{formatDisplayDate(inst.date)}</span>
                        {isCurrentMonth && (
                          <span className="badge badge-active" style={{ fontSize: 10, padding: '1px 5px' }}>
                            Current Month
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(inst.openingBalance, true)}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {formatPercent(inst.annualInterestRate)}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', color: '#64748b' }}>
                      {formatINR(inst.monthlyInterest, true)}
                      {inst.isManualInterest && (
                        <span title="Manual spreadsheet entry" style={{ marginLeft: 4, color: '#f59e0b', fontSize: 11 }}>
                          *
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(inst.scheduledEmi)}
                    </td>

                    {/* Paid Status Toggle */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onTogglePaidStatus) onTogglePaidStatus(inst);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        title="Click to toggle payment tracking status"
                      >
                        {inst.paidStatus === 'Yes' ? (
                          <span className="badge badge-active">
                            <CheckCircle2 size={12} />
                            Yes
                          </span>
                        ) : (
                          <span className="badge badge-closed">
                            No
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Extra Principal Payment */}
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: hasExtra ? 700 : 400,
                        color: hasExtra ? '#8b5cf6' : 'var(--text-muted)',
                      }}
                    >
                      {hasExtra ? formatINR(inst.extraAmountPaid) : '—'}
                    </td>

                    {/* Principal Reduced */}
                    <td style={{ textAlign: 'right', color: 'var(--success-text)', fontWeight: 600 }}>
                      {formatINR(inst.principalReduced, true)}
                    </td>

                    {/* Closing Balance */}
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatINR(inst.closingBalance, true)}
                    </td>

                    {/* Type Badge */}
                    <td style={{ textAlign: 'center' }}>
                      {inst.isProjected ? (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Projected
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                          Recorded
                        </span>
                      )}
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
