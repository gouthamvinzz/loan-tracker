import { Loan } from '../types/loan';
import { INITIAL_LOANS_DATA } from '../data/initialLoansData';

const STORAGE_KEY = 'loan_repayment_tracker_state_v2';

export class StorageService {
  /**
   * Load loans from LocalStorage or fall back to INITIAL_LOANS_DATA
   */
  public static loadLoans(): Loan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse stored loans from localStorage:', err);
    }

    // Default to initial imported loans
    this.saveLoans(INITIAL_LOANS_DATA);
    return INITIAL_LOANS_DATA;
  }

  /**
   * Persist loans to LocalStorage AND file system via /api/loans
   */
  public static saveLoans(loans: Loan[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
    } catch (err) {
      console.error('Failed to save loans to LocalStorage:', err);
    }

    // Also persist to server disk file
    try {
      fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loans),
      }).catch((err) => {
        // Silently catch if running in static environment
        console.debug('Server storage sync unavailable:', err);
      });
    } catch {
      // Ignore background network errors
    }
  }

  /**
   * Sync with server file storage on load
   */
  public static async syncFromServer(): Promise<Loan[] | null> {
    try {
      const res = await fetch('/api/loans');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.debug('Could not sync from server:', err);
    }
    return null;
  }

  /**
   * Reset loans back to initial imported Excel state
   */
  public static resetToDefault(): Loan[] {
    this.saveLoans(INITIAL_LOANS_DATA);
    return INITIAL_LOANS_DATA;
  }

  /**
   * Export all loan data as a JSON backup string
   */
  public static exportJSON(loans: Loan[]): string {
    return JSON.stringify(
      {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        loans,
      },
      null,
      2
    );
  }

  /**
   * Import loans from a JSON backup string
   */
  public static importJSON(jsonString: string): Loan[] {
    const data = JSON.parse(jsonString);
    if (!data.loans || !Array.isArray(data.loans)) {
      throw new Error('Invalid backup file: "loans" array not found.');
    }
    this.saveLoans(data.loans);
    return data.loans;
  }
}
