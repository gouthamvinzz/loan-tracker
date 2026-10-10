import { Trash2, Edit3, Zap } from 'lucide-react';
import { Loan, ExtraPayment } from '../../types/loan';
import { formatINR, formatDisplayDate } from '../../utils/formatters';

interface PaymentHistoryCardProps {
  loan: Loan;
  onEditExtraPayment: (payment: ExtraPayment) => void;
  onDeleteExtraPayment: (paymentId: string) => void;
  onAddExtraPayment: () => void;
}

export const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({
  loan,
  onEditExtraPayment,
  onDeleteExtraPayment,
  onAddExtraPayment,
}) => {
  const extraPayments = [...(loan.extraPayments || [])].sort((a, b) =>
    b.date.localeCompare(a.date)
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
              backgroundColor: '#f3e8ff',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
              Recorded Extra Principal Prepayments
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Lump sums directly reducing loan principal, shortening tenure, and saving interest
            </p>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onAddExtraPayment}>
          <Zap size={14} />
          <span>Add Prepayment</span>
        </button>
      </div>

      {extraPayments.length === 0 ? (
        <div
          style={{
            padding: '28px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-medium)',
          }}
        >
          No extra principal prepayments recorded yet for this loan.
          <div style={{ marginTop: 8 }}>
            <button
              onClick={onAddExtraPayment}
              className="btn btn-primary btn-sm"
            >
              Add First Prepayment
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {extraPayments.map((payment) => (
            <div
              key={payment.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#8b5cf6',
                    minWidth: 110,
                  }}
                >
                  {formatINR(payment.amount)}
                </div>

                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)' }}>
                    Paid on {formatDisplayDate(payment.date)}
                  </div>
                  {payment.note && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {payment.note}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => onEditExtraPayment(payment)}
                  className="btn btn-subtle btn-sm"
                  title="Edit prepayment amount or date"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete this extra payment of ${formatINR(
                          payment.amount
                        )}? Dependent calculations will be updated immediately.`
                      )
                    ) {
                      onDeleteExtraPayment(payment.id);
                    }
                  }}
                  className="btn btn-subtle btn-sm"
                  style={{ color: 'var(--danger-text)' }}
                  title="Delete prepayment"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
