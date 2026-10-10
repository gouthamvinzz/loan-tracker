import React from 'react';
import { Menu, Plus, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onOpenAddLoan: () => void;
  onExportExcel: () => void;
  onOpenBackup: () => void;
  activeLoanName?: string;
  onBackToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onOpenAddLoan,
  onExportExcel,
  onOpenBackup,
  activeLoanName,
  onBackToDashboard,
}) => {
  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
        <div>
          {activeLoanName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={onBackToDashboard}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Dashboard
              </button>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <h1 className="page-title">{activeLoanName}</h1>
            </div>
          ) : (
            <div>
              <h1 className="page-title">{title}</h1>
              {subtitle && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {subtitle}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="top-navbar-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onExportExcel}
          title="Export spreadsheet"
        >
          <FileSpreadsheet size={15} />
          <span style={{ display: 'inline-block' }}>Export Excel</span>
        </button>
        <button
          className="btn btn-subtle btn-sm"
          onClick={onOpenBackup}
          title="Backup & Restore Data"
        >
          <span>Backup</span>
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenAddLoan}
        >
          <Plus size={16} />
          <span>Add Loan</span>
        </button>
      </div>
    </header>
  );
};
