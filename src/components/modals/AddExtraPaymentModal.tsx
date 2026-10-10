import React, { useState, useMemo } from 'react';
import { X, Zap, Sparkles } from 'lucide-react';
import { Loan, ExtraPayment } from '../../types/loan';
import { FinancialEngine } from '../../services/financialEngine';
import { formatINR, formatDisplayDate } from '../../utils/formatters';

interface AddExtraPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onSaveExtraPayment: (paymentData: {
    id?: string;
    amount: number;
    date: string;
    note?: string;
    installmentDate?: string;
  }) => void;
  paymentToEdit?: ExtraPayment | null;
}

export const AddExtraPaymentModal: React.FC<AddExtraPaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  onSaveExtraPayment,
  paymentToEdit,
}) => {
  const [amount, setAmount] = useState<string>(
    paymentToEdit ? paymentToEdit.amount.toString() : '180000'
  );
  const [date, setDate] = useState<string>(
    paymentToEdit ? paymentToEdit.date : '2026-10-18'
  );
  const [note, setNote] = useState<string>(
    paymentToEdit ? paymentToEdit.note || '' : 'Extra principal prepayment'
  );
  const [error, setError] = useState<string>('');

  const parsedAmount = parseFloat(amount) || 0;

  // Calculate live before-and-after impact
  const impact = useMemo(() => {
    if (parsedAmount <= 0) return null;
    try {
      return FinancialEngine.calculateExtraPaymentImpact(
        loan,
        parsedAmount,
        date,
        paymentToEdit?.id
      );
    } catch (e) {
      console.warn('Failed to calculate impact:', e);
      return null;
    }
  }, [loan, parsedAmount, date, paymentToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setError('Please enter a valid extra payment amount greater than zero.');
      return;
    }
    if (!date) {
      setError('Please select a payment date.');
      return;
    }

    // Check if duplicate entry on same date with exact same amount (unless editing)
    if (!paymentToEdit) {
      const isDuplicate = loan.extraPayments.some(
        (ep) => ep.date === date && ep.amount === parsedAmount
      );
      if (isDuplicate) {
        if (!window.confirm('An extra payment with this exact amount and date already exists. Do you want to record another one?')) {
          return;
        }
      }
    }

    onSaveExtraPayment({
      id: paymentToEdit?.id,
      amount: parsedAmount,
      date,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
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
              <Zap size={18} />
            </div>
            <div>
              <h2 className="modal-title">
                {paymentToEdit ? 'Edit Prepayment' : 'Add Extra Principal Payment'}
              </h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Applied against: <strong>{loan.name}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Extra Payment Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="number"
                step="any"
                className={`form-input ${error ? 'form-input-error' : ''}`}
                placeholder="e.g. 180000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              {error && <div className="form-error-msg">{error}</div>}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Directly reduces principal balance. Keeps regular scheduled EMI unchanged.
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Payment Date <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Note <span className="form-label-hint">(optional)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Annual Bonus, Diwali Prepayment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Before-and-After Comparison Box (Direct inspiration from user screenshots ref1, ref2, ref3!) */}
            {impact && parsedAmount > 0 && (
              <div className="impact-comparison-box">
                <div className="impact-title">
                  <Sparkles size={15} />
                  <span>Projected Financial Impact</span>
                </div>

                <div className="impact-grid">
                  <div className="impact-stat-card">
                    <div className="impact-stat-label">Projected Interest Saved</div>
                    <div className="impact-stat-val positive">
                      {formatINR(impact.savings.interestSaved)}
                    </div>
                  </div>

                  <div className="impact-stat-card">
                    <div className="impact-stat-label">Tenure Reduced</div>
                    <div className="impact-stat-val">
                      {impact.savings.monthsReduced > 0
                        ? `${impact.savings.monthsReduced} Months`
                        : '0 Months'}
                    </div>
                  </div>

                  <div className="impact-stat-card">
                    <div className="impact-stat-label">New Balance on Payment</div>
                    <div className="impact-stat-val" style={{ color: 'var(--text-main)', fontSize: 16 }}>
                      {formatINR(impact.savings.newBalance)}
                    </div>
                  </div>

                  <div className="impact-stat-card">
                    <div className="impact-stat-label">New Target Payoff Date</div>
                    <div className="impact-stat-val" style={{ color: '#ea580c', fontSize: 15 }}>
                      {impact.updated.closureDate
                        ? formatDisplayDate(impact.updated.closureDate)
                        : 'Paid Off'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginTop: 10,
                    lineHeight: 1.4,
                  }}
                >
                  * Note: Projected savings calculated by comparing schedule with and without this prepayment under identical interest-rate conditions.
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Zap size={15} />
              <span>{paymentToEdit ? 'Save Changes' : 'Apply Extra Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
