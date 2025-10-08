// Central application-level configuration (limits, thresholds, etc.)
// These can be later loaded from env or user settings if needed.

export const DATA_LIMITS = {
  maxFileBytes: 10 * 1024 * 1024, // 10MB
  maxColumns: 500,
  maxRows: 500_000,
};

export type DataLimitKey = keyof typeof DATA_LIMITS;

export interface LimitViolationSummary {
  limit: DataLimitKey | 'structure';
  message: string;
}
