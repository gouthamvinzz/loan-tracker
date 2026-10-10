import { Plus, History, Calendar } from 'lucide-react';
import { Loan } from '../../types/loan';
import { formatPercent, formatDisplayDate } from '../../utils/formatters';

interface RateHistoryCardProps {
  loan: Loan;
  onOpenAddRateChange: () => void;
}

export const RateHistoryCard: React.FC<RateHistoryCardProps> = ({
  loan,
  onOpenAddRateChange,
}) => {
  const sortedRevisions = [...(loan.rateHistory || [])].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate)
  );

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-accent-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
              Interest Rate History & Revisions
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Chronological rate revisions with effective dates. Applied to subsequent periods.
            </p>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onOpenAddRateChange}>
          <Plus size={14} />
          <span>Add Rate Change</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedRevisions.length === 0 ? (
          <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
            No revisions recorded. Currently using default rate {formatPercent(loan.currentInterestRate)}.
          </div>
        ) : (
          sortedRevisions.map((rev, index) => {
            const isLatest = index === sortedRevisions.length - 1;
            return (
              <div
                key={rev.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isLatest ? 'var(--bg-accent-subtle)' : '#f8fafc',
                  border: `1px solid ${isLatest ? 'var(--border-accent)' : 'var(--border-light)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: isLatest ? 'var(--primary)' : 'var(--text-main)',
                      minWidth: 65,
                    }}
                  >
                    {formatPercent(rev.rate)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                      <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>Effective from {formatDisplayDate(rev.effectiveDate)}</span>
                      {isLatest && (
                        <span className="badge badge-blue" style={{ fontSize: 10, padding: '1px 6px' }}>
                          Current Active
                        </span>
                      )}
                    </div>
                    {rev.note && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {rev.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
