import * as XLSX from 'xlsx';
import { Loan } from '../types/loan';
import { FinancialEngine } from './financialEngine';

export class ExportService {
  /**
   * Export the entire loans portfolio to an Excel file matching the structure of
   * the original loan repayment tracker workbook.
   */
  public static exportToExcel(loans: Loan[], filename: string = 'loan_repayment_tracker_export.xlsx'): void {
    const wb = XLSX.utils.book_new();
    const masterSummary = FinancialEngine.calculateMasterSummary(loans);

    // 1. Create Master Sheet
    const masterHeaders = [
      'Loan Name',
      'Starting Principal',
      'Current Principal',
      '%',
      'Base EMI',
      'Extra Paid',
      'Date closing',
      'Status',
    ];

    const masterRows: (string | number | null)[][] = [masterHeaders];

    masterSummary.loanSummaries.forEach((s) => {
      masterRows.push([
        s.loan.name,
        s.originalPrincipal,
        s.currentOutstandingPrincipal,
        s.currentRate ? s.currentRate / 100 : 0,
        s.monthlyEmi,
        s.totalExtraPaid,
        s.estimatedClosureDate ?? 'Closed',
        s.status.toUpperCase(),
      ]);
    });

    // Total Row
    masterRows.push([
      'Total',
      masterSummary.totalOriginalPrincipal,
      masterSummary.totalOutstandingPrincipal,
      null,
      masterSummary.totalMonthlyEmiCommitment,
      masterSummary.totalExtraPrincipalPaid,
      masterSummary.estimatedDebtFreeDate ?? 'N/A',
      'ACTIVE PORTFOLIO',
    ]);

    masterRows.push([]);
    masterRows.push(['Current completed', masterSummary.totalPrincipalRepaid]);

    const masterSheet = XLSX.utils.aoa_to_sheet(masterRows);
    XLSX.utils.book_append_sheet(wb, masterSheet, 'Master');

    // 2. Create Individual Loan Sheets
    loans.forEach((loan) => {
      const schedule = FinancialEngine.generateSchedule(loan);
      const sheetHeaders = [
        'Date',
        'Opening Balance',
        'Monthly Interest',
        'EMI Amount',
        'Paid Status',
        'Extra Amount Paid',
        'Principal Reduced',
        'Closing Balance',
      ];

      const sheetRows: (string | number | null)[][] = [sheetHeaders];

      schedule.forEach((inst) => {
        sheetRows.push([
          inst.date,
          Math.round(inst.openingBalance * 100) / 100,
          Math.round(inst.monthlyInterest * 100) / 100,
          inst.scheduledEmi,
          inst.paidStatus,
          inst.extraAmountPaid,
          Math.round(inst.principalReduced * 100) / 100,
          Math.round(inst.closingBalance * 100) / 100,
        ]);
      });

      // Sheet name in Excel must be <= 31 chars and no illegal characters
      const cleanSheetName = loan.name.replace(/[\\/:*?[\]]/g, '').substring(0, 31) || 'Loan';
      const loanSheet = XLSX.utils.aoa_to_sheet(sheetRows);
      XLSX.utils.book_append_sheet(wb, loanSheet, cleanSheetName);
    });

    // Save Excel file
    XLSX.writeFile(wb, filename);
  }

  /**
   * Export summary and schedules to CSV
   */
  public static exportToCSV(loans: Loan[], filename: string = 'loan_portfolio_summary.csv'): void {
    const masterSummary = FinancialEngine.calculateMasterSummary(loans);
    const rows: string[] = [];

    rows.push('Loan Name,Original Principal,Current Balance,Rate (%),Monthly EMI,Extra Paid,Target Closure Date,Status');

    masterSummary.loanSummaries.forEach((s) => {
      rows.push(
        `"${s.loan.name}",${s.originalPrincipal},${s.currentOutstandingPrincipal},${s.currentRate},${s.monthlyEmi},${s.totalExtraPaid},"${s.estimatedClosureDate ?? 'Closed'}",${s.status}`
      );
    });

    rows.push(
      `"TOTAL",${masterSummary.totalOriginalPrincipal},${masterSummary.totalOutstandingPrincipal},-,${masterSummary.totalMonthlyEmiCommitment},${masterSummary.totalExtraPrincipalPaid},"${masterSummary.estimatedDebtFreeDate ?? 'N/A'}",-`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
