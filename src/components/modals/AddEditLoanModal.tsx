import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Loan, LoanStatus } from '../../types/loan';

interface AddEditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLoan: (loanData: Partial<Loan>) => void;
  loanToEdit: Loan | null;
}

export const AddEditLoanModal: React.FC<AddEditLoanModalProps> = ({
  isOpen,
  onClose,
  onSaveLoan,
  loanToEdit,
}) => {
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [originalPrincipal, setOriginalPrincipal] = useState('');
  const [initialOpeningBalance, setInitialOpeningBalance] = useState('');
  const [currentInterestRate, setCurrentInterestRate] = useState('');
  const [baseEmi, setBaseEmi] = useState('');
  const [startDate, setStartDate] = useState('');
  const [repaymentDay, setRepaymentDay] = useState('18');
  const [status, setStatus] = useState<LoanStatus>('active');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loanToEdit) {
      setName(loanToEdit.name);
      setLender(loanToEdit.lender || '');
      setOriginalPrincipal(loanToEdit.originalPrincipal.toString());
      setInitialOpeningBalance(loanToEdit.initialOpeningBalance.toString());
      setCurrentInterestRate(loanToEdit.currentInterestRate.toString());
      setBaseEmi(loanToEdit.baseEmi.toString());
      setStartDate(loanToEdit.startDate);
      setRepaymentDay(loanToEdit.repaymentDay.toString());
      setStatus(loanToEdit.status);
      setNotes(loanToEdit.notes || '');
    } else {
      setName('');
      setLender('');
      setOriginalPrincipal('');
      setInitialOpeningBalance('');
      setCurrentInterestRate('10.0');
      setBaseEmi('0');
      setStartDate('2026-10-18');
      setRepaymentDay('18');
      setStatus('active');
      setNotes('');
    }
    setErrors({});
  }, [loanToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Loan name is required.';
    const origP = parseFloat(originalPrincipal);
    if (isNaN(origP) || origP <= 0) {
      newErrors.originalPrincipal = 'Original principal must be a positive number.';
    }

    const initBal = parseFloat(initialOpeningBalance || originalPrincipal);
    if (isNaN(initBal) || initBal < 0) {
      newErrors.initialOpeningBalance = 'Opening balance must be 0 or greater.';
    }

    const rate = parseFloat(currentInterestRate);
    if (isNaN(rate) || rate < 0) {
      newErrors.currentInterestRate = 'Interest rate must be 0 or greater.';
    }

    const emi = parseFloat(baseEmi);
    if (isNaN(emi) || emi < 0) {
      newErrors.baseEmi = 'EMI must be 0 or greater (enter 0 for bullet repayment loans).';
    }

    if (!startDate) newErrors.startDate = 'Start date is required.';

    const day = parseInt(repaymentDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      newErrors.repaymentDay = 'Repayment day must be between 1 and 31.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveLoan({
      name: name.trim(),
      lender: lender.trim() || undefined,
      originalPrincipal: origP,
      initialOpeningBalance: initBal,
      currentInterestRate: rate,
      baseEmi: emi,
      startDate,
      repaymentDay: day,
      status,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {loanToEdit ? 'Edit Loan' : 'Add New Loan'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Loan Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                placeholder="e.g. Home Loan, Gold Loan, EL 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <div className="form-error-msg">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Lender / Bank <span className="form-label-hint">(optional)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. HDFC Bank, SBI, Family"
                value={lender}
                onChange={(e) => setLender(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Original Principal (₹) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  className={`form-input ${errors.originalPrincipal ? 'form-input-error' : ''}`}
                  placeholder="e.g. 2500000"
                  value={originalPrincipal}
                  onChange={(e) => {
                    setOriginalPrincipal(e.target.value);
                    if (!loanToEdit && !initialOpeningBalance) {
                      setInitialOpeningBalance(e.target.value);
                    }
                  }}
                />
                {errors.originalPrincipal && (
                  <div className="form-error-msg">{errors.originalPrincipal}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Starting Opening Balance (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  className={`form-input ${errors.initialOpeningBalance ? 'form-input-error' : ''}`}
                  placeholder="Defaults to original principal"
                  value={initialOpeningBalance}
                  onChange={(e) => setInitialOpeningBalance(e.target.value)}
                />
                {errors.initialOpeningBalance && (
                  <div className="form-error-msg">{errors.initialOpeningBalance}</div>
                )}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Annual Interest Rate (%) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-input ${errors.currentInterestRate ? 'form-input-error' : ''}`}
                  placeholder="e.g. 9.5"
                  value={currentInterestRate}
                  onChange={(e) => setCurrentInterestRate(e.target.value)}
                />
                {errors.currentInterestRate && (
                  <div className="form-error-msg">{errors.currentInterestRate}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Monthly EMI (₹) <span className="form-label-hint">(0 for bullet loans)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  className={`form-input ${errors.baseEmi ? 'form-input-error' : ''}`}
                  placeholder="e.g. 25000"
                  value={baseEmi}
                  onChange={(e) => setBaseEmi(e.target.value)}
                />
                {errors.baseEmi && <div className="form-error-msg">{errors.baseEmi}</div>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Loan Start / First EMI Date <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  className={`form-input ${errors.startDate ? 'form-input-error' : ''}`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && (
                  <div className="form-error-msg">{errors.startDate}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Repayment Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className={`form-input ${errors.repaymentDay ? 'form-input-error' : ''}`}
                  value={repaymentDay}
                  onChange={(e) => setRepaymentDay(e.target.value)}
                />
                {errors.repaymentDay && (
                  <div className="form-error-msg">{errors.repaymentDay}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Loan Status</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                  />
                  <span>Active Loan</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    value="closed"
                    checked={status === 'closed'}
                    onChange={() => setStatus('closed')}
                  />
                  <span>Closed / Fully Settled</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Notes <span className="form-label-hint">(optional)</span>
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Account number, floating rate terms, agreement references..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {loanToEdit ? 'Save Changes' : 'Create Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
