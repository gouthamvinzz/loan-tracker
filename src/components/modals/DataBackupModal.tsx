import React, { useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { Loan } from '../../types/loan';
import { StorageService } from '../../services/storageService';
import { ExportService } from '../../services/exportService';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  onLoansUpdated: (newLoans: Loan[]) => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  loans,
  onLoansUpdated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const jsonStr = StorageService.exportJSON(loans);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const importedLoans = StorageService.importJSON(content);
        onLoansUpdated(importedLoans);
        alert('Backup restored successfully!');
        onClose();
      } catch (err: any) {
        alert(`Failed to restore backup: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the original Excel workbook state? All local edits made will be reset to the imported spreadsheet defaults.'
      )
    ) {
      const defaultLoans = StorageService.resetToDefault();
      onLoansUpdated(defaultLoans);
      alert('Reset to original Excel workbook data successfully.');
      onClose();
    }
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
              <Database size={18} />
            </div>
            <div>
              <h2 className="modal-title">Data Backup & Export Management</h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Persistent local storage • Export spreadsheets • Restore backups
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Export section */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#fafbfc',
            }}
          >
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
              Export Spreadsheets & Backups
            </h4>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
              Download complete portfolio and individual repayment sheets.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => ExportService.exportToExcel(loans)}
              >
                <FileSpreadsheet size={15} />
                <span>Export to Excel (.xlsx)</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => ExportService.exportToCSV(loans)}
              >
                <Download size={15} />
                <span>Export Summary CSV</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleDownloadJSON}
              >
                <Download size={15} />
                <span>Download JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Import / Restore Section */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#fafbfc',
            }}
          >
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
              Restore from JSON Backup
            </h4>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
              Upload a previously exported JSON backup file to restore all loan records.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              className="btn btn-subtle btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={15} />
              <span>Select Backup File (.json)</span>
            </button>
          </div>

          {/* Reset to Original Excel */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--danger-border)',
              backgroundColor: varDangerBg(),
            }}
          >
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--danger-text)' }}>
              Reset to Original Excel Tracker
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Reload the exact baseline state from <code>loan_repayment_tracker_precise_fixed (1).xlsx</code>.
            </p>
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
              }}
              onClick={handleResetToDefault}
            >
              <RotateCcw size={14} />
              <span>Reset to Workbook Defaults</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function varDangerBg() {
  return '#fef2f2';
}
