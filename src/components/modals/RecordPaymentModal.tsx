import React, { useState } from 'react';
import { X, Coins, CheckCircle2 } from 'lucide-react';
import { Loan } from '../../types/loan';
import { formatINR } from '../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onRecordPayment: (paymentData: {
    amount: number;
    date: string;
    note?: string;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  onRecordPayment,
}) => {
  const [amount, setAmount] = useState<string>(loan.baseEmi.toString());
  const [date, setDate] = useState<string>('2026-10-18');
  const [note, setNote] = useState<string>('Regular monthly installment');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    onRecordPayment({
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
                backgroundColor: 'var(--bg-accent-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Coins size={18} />
            </div>
            <div>
              <h2 className="modal-title">Record Monthly EMI Payment</h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Loan: <strong>{loan.name}</strong>
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
                EMI Payment Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Scheduled EMI amount for this loan is {formatINR(loan.baseEmi)}.
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
                <label className="form-label">Note / Transaction Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bank Auto-Debit Ref #1234"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Confirm & Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
