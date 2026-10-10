import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MasterDashboardView } from './components/dashboard/MasterDashboardView';
import { LoanDetailView } from './components/loanDetail/LoanDetailView';
import { AddEditLoanModal } from './components/modals/AddEditLoanModal';
import { AddExtraPaymentModal } from './components/modals/AddExtraPaymentModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { AddRateChangeModal } from './components/modals/AddRateChangeModal';
import { DataBackupModal } from './components/modals/DataBackupModal';
import { StorageService } from './services/storageService';
import { ExportService } from './services/exportService';
import { FinancialEngine } from './services/financialEngine';
import { Loan, ExtraPayment, Installment } from './types/loan';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>(() => StorageService.loadLoans());
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // Sync with persistent server storage on load
  useEffect(() => {
    StorageService.syncFromServer().then((remoteLoans) => {
      if (remoteLoans && Array.isArray(remoteLoans) && remoteLoans.length > 0) {
        setLoans(remoteLoans);
      }
    });
  }, []);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [loanToEdit, setLoanToEdit] = useState<Loan | null>(null);

  const [isExtraPaymentModalOpen, setIsExtraPaymentModalOpen] = useState(false);
  const [extraPaymentToEdit, setExtraPaymentToEdit] = useState<ExtraPayment | null>(null);

  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isRateChangeModalOpen, setIsRateChangeModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync state to local persistence whenever loans update
  const updateLoans = (newLoans: Loan[]) => {
    setLoans(newLoans);
    StorageService.saveLoans(newLoans);
  };

  // Master Summary
  const masterSummary = FinancialEngine.calculateMasterSummary(loans);

  // Active Loan
  const selectedLoan = selectedLoanId
    ? loans.find((l) => l.id === selectedLoanId) || null
    : null;

  // Handler: Add or Edit Loan
  const handleSaveLoan = (loanData: Partial<Loan>) => {
    if (loanToEdit) {
      const updatedLoans = loans.map((l) =>
        l.id === loanToEdit.id ? ({ ...l, ...loanData } as Loan) : l
      );
      updateLoans(updatedLoans);
      showToast(`Updated "${loanData.name || loanToEdit.name}" successfully.`);
    } else {
      const newLoanId = `loan-${Date.now()}`;
      const newLoan: Loan = {
        id: newLoanId,
        name: loanData.name || 'New Loan',
        lender: loanData.lender,
        originalPrincipal: loanData.originalPrincipal || 0,
        initialOpeningBalance: loanData.initialOpeningBalance || loanData.originalPrincipal || 0,
        currentInterestRate: loanData.currentInterestRate || 10.0,
        baseEmi: loanData.baseEmi || 0,
        startDate: loanData.startDate || '2026-10-18',
        repaymentDay: loanData.repaymentDay || 18,
        status: loanData.status || 'active',
        notes: loanData.notes,
        rateHistory: [
          {
            id: `rate-${Date.now()}`,
            rate: loanData.currentInterestRate || 10.0,
            effectiveDate: loanData.startDate || '2026-10-18',
            note: 'Initial interest rate',
          },
        ],
        extraPayments: [],
        historicalInstallments: [],
      };
      updateLoans([...loans, newLoan]);
      setSelectedLoanId(newLoanId);
      showToast(`Created new loan "${newLoan.name}".`);
    }
    setLoanToEdit(null);
  };

  // Handler: Add or Edit Extra Payment
  const handleSaveExtraPayment = (paymentData: {
    id?: string;
    amount: number;
    date: string;
    note?: string;
    installmentDate?: string;
  }) => {
    if (!selectedLoan) return;

    let updatedExtraPayments: ExtraPayment[];
    if (paymentData.id) {
      // Edit existing
      updatedExtraPayments = selectedLoan.extraPayments.map((ep) =>
        ep.id === paymentData.id
          ? {
              ...ep,
              amount: paymentData.amount,
              date: paymentData.date,
              note: paymentData.note,
              installmentDate: paymentData.installmentDate,
            }
          : ep
      );
      showToast('Prepayment updated successfully.');
    } else {
      // Add new
      const newPayment: ExtraPayment = {
        id: `ep-${Date.now()}`,
        amount: paymentData.amount,
        date: paymentData.date,
        note: paymentData.note,
        installmentDate: paymentData.installmentDate,
        createdAt: new Date().toISOString(),
      };
      updatedExtraPayments = [...selectedLoan.extraPayments, newPayment];
      showToast(`Extra principal payment of ₹${paymentData.amount.toLocaleString('en-IN')} applied.`);
    }

    const updatedLoans = loans.map((l) =>
      l.id === selectedLoan.id ? { ...l, extraPayments: updatedExtraPayments } : l
    );
    updateLoans(updatedLoans);
    setExtraPaymentToEdit(null);
  };

  // Handler: Delete Extra Payment
  const handleDeleteExtraPayment = (paymentId: string) => {
    if (!selectedLoan) return;

    const updatedExtraPayments = selectedLoan.extraPayments.filter(
      (ep) => ep.id !== paymentId
    );
    const updatedLoans = loans.map((l) =>
      l.id === selectedLoan.id ? { ...l, extraPayments: updatedExtraPayments } : l
    );
    updateLoans(updatedLoans);
    showToast('Extra payment deleted. Schedule updated.');
  };

  // Handler: Add Interest Rate Revision
  const handleSaveRateRevision = (revisionData: {
    rate: number;
    effectiveDate: string;
    note?: string;
  }) => {
    if (!selectedLoan) return;

    const newRevision = {
      id: `rev-${Date.now()}`,
      rate: revisionData.rate,
      effectiveDate: revisionData.effectiveDate,
      note: revisionData.note,
      createdAt: new Date().toISOString(),
    };

    const updatedRateHistory = [...(selectedLoan.rateHistory || []), newRevision].sort(
      (a, b) => a.effectiveDate.localeCompare(b.effectiveDate)
    );

    const updatedLoans = loans.map((l) =>
      l.id === selectedLoan.id
        ? {
            ...l,
            currentInterestRate: revisionData.rate,
            rateHistory: updatedRateHistory,
          }
        : l
    );
    updateLoans(updatedLoans);
    showToast(`Interest rate revision (${revisionData.rate}%) applied.`);
  };

  // Handler: Toggle Paid Status on Installment
  const handleTogglePaidStatus = (installment: Installment) => {
    if (!selectedLoan) return;

    const newStatus = installment.paidStatus === 'Yes' ? 'No' : 'Yes';

    // Update historicalInstallments in loan
    const currentHist = selectedLoan.historicalInstallments || [];
    const exists = currentHist.some((h) => h.date === installment.date);

    let updatedHist: Installment[];
    if (exists) {
      updatedHist = currentHist.map((h) =>
        h.date === installment.date
          ? {
              ...h,
              paidStatus: newStatus,
              actualEmiPaid: newStatus === 'Yes' ? h.scheduledEmi : 0,
            }
          : h
      );
    } else {
      // Add this installment as historical entry
      updatedHist = [
        ...currentHist,
        {
          ...installment,
          paidStatus: newStatus,
          actualEmiPaid: newStatus === 'Yes' ? installment.scheduledEmi : 0,
          isProjected: false,
        },
      ];
    }

    const updatedLoans = loans.map((l) =>
      l.id === selectedLoan.id
        ? { ...l, historicalInstallments: updatedHist }
        : l
    );
    updateLoans(updatedLoans);
    showToast(`Payment marked as ${newStatus === 'Yes' ? 'Paid' : 'Unpaid'}.`);
  };

  // Handler: Record Payment from Modal
  const handleRecordPayment = (paymentData: { amount: number; date: string; note?: string }) => {
    if (!selectedLoan) return;

    const currentHist = selectedLoan.historicalInstallments || [];
    const existing = currentHist.find((h) => h.date === paymentData.date);

    let updatedHist: Installment[];
    if (existing) {
      updatedHist = currentHist.map((h) =>
        h.date === paymentData.date
          ? {
              ...h,
              paidStatus: 'Yes',
              actualEmiPaid: paymentData.amount,
              note: paymentData.note,
            }
          : h
      );
    } else {
      // Generate installment for this date
      const schedule = FinancialEngine.generateSchedule(selectedLoan);
      const matched = schedule.find((s) => s.date === paymentData.date);
      if (matched) {
        updatedHist = [
          ...currentHist,
          {
            ...matched,
            paidStatus: 'Yes',
            actualEmiPaid: paymentData.amount,
            note: paymentData.note,
            isProjected: false,
          },
        ];
      } else {
        updatedHist = currentHist;
      }
    }

    const updatedLoans = loans.map((l) =>
      l.id === selectedLoan.id
        ? { ...l, historicalInstallments: updatedHist }
        : l
    );
    updateLoans(updatedLoans);
    showToast(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} recorded successfully.`);
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 24,
            zIndex: 100,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        summary={masterSummary}
        selectedLoanId={selectedLoanId}
        onSelectLoan={(id) => setSelectedLoanId(id)}
        onOpenAddLoan={() => {
          setLoanToEdit(null);
          setIsAddEditModalOpen(true);
        }}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onExportExcel={() => ExportService.exportToExcel(loans)}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Header
          title={selectedLoan ? selectedLoan.name : 'Master Loan Dashboard'}
          subtitle={
            selectedLoan
              ? undefined
              : `Consolidated view of ${masterSummary.activeLoanCount} active loans and total debt`
          }
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenAddLoan={() => {
            setLoanToEdit(null);
            setIsAddEditModalOpen(true);
          }}
          onExportExcel={() => ExportService.exportToExcel(loans)}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          activeLoanName={selectedLoan?.name}
          onBackToDashboard={() => setSelectedLoanId(null)}
        />

        <main className="content-container">
          {selectedLoan ? (
            <LoanDetailView
              loan={selectedLoan}
              onRecordPayment={() => setIsRecordPaymentModalOpen(true)}
              onAddExtraPayment={() => {
                setExtraPaymentToEdit(null);
                setIsExtraPaymentModalOpen(true);
              }}
              onEditLoan={() => {
                setLoanToEdit(selectedLoan);
                setIsAddEditModalOpen(true);
              }}
              onOpenAddRateChange={() => setIsRateChangeModalOpen(true)}
              onEditExtraPayment={(ep) => {
                setExtraPaymentToEdit(ep);
                setIsExtraPaymentModalOpen(true);
              }}
              onDeleteExtraPayment={handleDeleteExtraPayment}
              onTogglePaidStatus={handleTogglePaidStatus}
            />
          ) : (
            <MasterDashboardView
              summary={masterSummary}
              onSelectLoan={(id) => setSelectedLoanId(id)}
              onOpenAddLoan={() => {
                setLoanToEdit(null);
                setIsAddEditModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddEditLoanModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setLoanToEdit(null);
        }}
        onSaveLoan={handleSaveLoan}
        loanToEdit={loanToEdit}
      />

      {selectedLoan && (
        <>
          <AddExtraPaymentModal
            isOpen={isExtraPaymentModalOpen}
            onClose={() => {
              setIsExtraPaymentModalOpen(false);
              setExtraPaymentToEdit(null);
            }}
            loan={selectedLoan}
            onSaveExtraPayment={handleSaveExtraPayment}
            paymentToEdit={extraPaymentToEdit}
          />

          <RecordPaymentModal
            isOpen={isRecordPaymentModalOpen}
            onClose={() => setIsRecordPaymentModalOpen(false)}
            loan={selectedLoan}
            onRecordPayment={handleRecordPayment}
          />

          <AddRateChangeModal
            isOpen={isRateChangeModalOpen}
            onClose={() => setIsRateChangeModalOpen(false)}
            loan={selectedLoan}
            onSaveRateRevision={handleSaveRateRevision}
          />
        </>
      )}

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        loans={loans}
        onLoansUpdated={updateLoans}
      />
    </div>
  );
};

export default App;
