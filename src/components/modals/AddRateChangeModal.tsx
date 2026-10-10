import React, { useState } from 'react';
import { X, Percent, Info } from 'lucide-react';
import { Loan } from '../../types/loan';
import { formatPercent, formatDisplayDate } from '../../utils/formatters';

interface AddRateChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onSaveRateRevision: (revisionData: {
    rate: number;
    effectiveDate: string;
    note?: string;
  }) => void;
}

export const AddRateChangeModal: React.FC<AddRateChangeModalProps> = ({
  isOpen,
  onClose,
  loan,
  onSaveRateRevision,
}) => {
  const [rate, setRate] = useState<string>(loan.currentInterestRate.toString());
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-11-01');
  const [note, setNote] = useState<string>('RBI repo rate change revision');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(rate);
    if (isNaN(parsedRate) || parsedRate < 0) {
      setError('Please enter a valid interest rate (0% or greater).');
      return;
    }
    if (!effectiveDate) {
      setError('Please enter a valid effective date.');
      return;
    }

    onSaveRateRevision({
      rate: parsedRate,
      effectiveDate,
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
              <Percent size={18} />
            </div>
            <div>
              <h2 className="modal-title">Record Interest Rate Revision</h2>
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
                New Annual Interest Rate (%) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className={`form-input ${error ? 'form-input-error' : ''}`}
                placeholder="e.g. 9.65"
                value={rate}
                onChange={(e) => {
                  setRate(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              {error && <div className="form-error-msg">{error}</div>}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Currently applicable rate is {formatPercent(loan.currentInterestRate)}.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Effective Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Revision Reason / Note</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bank reset, MCLR revision notification"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.4 }}>
                <strong>Transparent Recalculation Rule:</strong> This rate will apply to all installments on or after{' '}
                <strong>{formatDisplayDate(effectiveDate)}</strong>. Earlier historical periods and recorded actual payments are preserved and will not be overwritten.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Apply Rate Revision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
