import { Dataset } from '@/store/state';
import Papa from 'papaparse';
import { DATA_LIMITS, LimitViolationSummary } from '@/lib/config/appConfig';

export interface ParseResult {
  success: boolean;
  data?: Dataset;
  error?: string;
}

export interface CSVParseOptions {
  header?: boolean; // keep for backwards compat (if true, headerRow assumed 0 after skip)
  skipEmptyLines?: boolean;
  delimiter?: string;
  skipRows?: number; // number of rows to skip before considering header
  headerRow?: number; // header row index after skipping skipRows (default 0)
  targetColumn?: string; // allow explicit target override
  featureColumns?: string[]; // allow explicit feature override
}

// Centralized ingestion / preview types
export type SimpleMissingStrategy =
  | 'leave-as-is'
  | 'drop-row'
  | 'zero'
  | 'mean'
  | 'median'
  | 'mode';

export type ColumnMissingStrategy =
  | SimpleMissingStrategy
  | { type: 'constant'; value: string | number };

export interface IngestionConfig {
  skipRows: number;
  headerRow: number; // relative to post-skip
  targetColumn?: string;
  featureColumns?: string[];
  previewLimit?: number; // number of raw rows to keep for preview (unshifted)
  // New strategy settings
  globalStrategy?: SimpleMissingStrategy; // fallback when columnStrategies missing
  columnStrategies?: Record<string, ColumnMissingStrategy>; // per-column overrides
  treatPlaceholdersAsMissing?: boolean; // future toggle to normalize placeholder tokens to '' pre-imputation
}

export interface PreviewColumnStats {
  missing: number; // count of missing values in preview rows (structured region only)
  unique?: number; // unique value count (optional, can be expensive)
  inferredType: 'numeric' | 'categorical' | 'mixed' | 'empty';
  placeholderMissing?: number; // count of placeholder tokens treated as potential missing
  examplePlaceholders?: string[]; // sample placeholder tokens (normalized original forms)
  numericFraction?: number; // fraction of non-missing values that are numeric (0..1)
}

export interface PreviewResult {
  success: boolean;
  error?: string;
  rawRowCount?: number;
  headerAbsoluteIndex?: number;
  dataStartIndex?: number;
  columns?: string[];
  previewRecords?: Record<string, string | number>[]; // structured preview rows (limited)
  stats?: Record<string, PreviewColumnStats>;
  config?: IngestionConfig;
  cellFlags?: ('missing' | 'placeholder' | 'valid')[][]; // per preview row/column classification
  limitErrors?: LimitViolationSummary[]; // violations of dataset size limits
}

export const defaultIngestionConfig: IngestionConfig = {
  skipRows: 0,
  headerRow: 0,
  previewLimit: 50,
};

/**
 * Generate a lightweight preview without constructing a full Dataset.
 * Keeps the first previewLimit raw rows fixed and overlays current ingestion config.
 */
export function generatePreview(
  text: string,
  cfg: Partial<IngestionConfig>
): PreviewResult {
  const config: IngestionConfig = {
    ...defaultIngestionConfig,
    ...cfg,
  } as IngestionConfig;
  try {
    const result = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
    });
    if (result.errors.length) {
      return {
        success: false,
        error: result.errors.map(e => e.message).join(', '),
      };
    }
    const rows = result.data as unknown as string[][];
    const { skipRows, headerRow, previewLimit } = config;
    if (rows.length === 0)
      return { success: false, error: 'No rows found', config };
    if (skipRows >= rows.length)
      return { success: false, error: 'skipRows >= total rows', config };
    const headerAbs = skipRows + headerRow;
    if (headerAbs >= rows.length)
      return { success: false, error: 'headerRow out of range', config };
    const headerValues = rows[headerAbs] || [];
    // Unique column naming like final parser
    const seen = new Map<string, number>();
    const columns = headerValues.map(h => {
      const base = (h ?? '').toString().trim() || 'col';
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base}_${count}`;
    });
    const limitErrors: LimitViolationSummary[] = [];
    // Structural limits first
    if (rows.length > DATA_LIMITS.maxRows) {
      limitErrors.push({
        limit: 'maxRows',
        message: `Row count ${rows.length.toLocaleString()} exceeds maximum ${DATA_LIMITS.maxRows.toLocaleString()}`,
      });
    }
    if (headerValues.length > DATA_LIMITS.maxColumns) {
      limitErrors.push({
        limit: 'maxColumns',
        message: `Column count ${headerValues.length} exceeds maximum ${DATA_LIMITS.maxColumns}`,
      });
    }
    const previewRawRows = rows.slice(0, previewLimit);
    const dataStartIndex = headerAbs + 1;
    const previewRecords: Record<string, string | number>[] = [];
    const cellFlags: ('missing' | 'placeholder' | 'valid')[][] = [];
    // Placeholder token set (normalized lowercase)
    const PLACEHOLDERS = new Set([
      'na',
      'n/a',
      'null',
      'none',
      'nil',
      'nan',
      '?',
      '-',
      'missing',
      'unknown',
      '.',
    ]);
    previewRawRows.forEach(r => {
      const obj: Record<string, string | number> = {};
      const rowFlags: ('missing' | 'placeholder' | 'valid')[] = [];
      columns.forEach((c, i) => {
        const raw = r?.[i] ?? '';
        obj[c] = raw;
        const trimmed =
          raw === null || raw === undefined ? '' : raw.toString().trim();
        if (trimmed === '') rowFlags.push('missing');
        else if (PLACEHOLDERS.has(trimmed.toLowerCase()))
          rowFlags.push('placeholder');
        else rowFlags.push('valid');
      });
      previewRecords.push(obj);
      cellFlags.push(rowFlags);
    });
    // Column stats (missing + placeholders + inferred type over preview region after header)
    const stats: Record<string, PreviewColumnStats> = {};
    columns.forEach(col => {
      const values: (string | number)[] = [];
      const placeholdersEncountered: string[] = [];
      previewRecords.forEach((rec, idx) => {
        // Only consider rows that are candidate data rows (idx relative to raw)
        const rawIndex = idx; // because previewRawRows starts at 0
        if (rawIndex >= dataStartIndex) {
          values.push(rec[col]);
        }
      });
      const nonMissing = values.filter(
        v => v !== '' && v !== null && v !== undefined
      );
      let placeholderCount = 0;
      nonMissing.forEach(v => {
        const norm = v.toString().trim().toLowerCase();
        if (PLACEHOLDERS.has(norm)) {
          placeholderCount++;
          if (
            placeholdersEncountered.length < 5 &&
            !placeholdersEncountered.includes(norm)
          ) {
            placeholdersEncountered.push(norm);
          }
        }
      });
      const missingCount = values.length - nonMissing.length;
      let inferredType: PreviewColumnStats['inferredType'] = 'empty';
      if (values.length > 0) {
        const numericCount = nonMissing.filter(v => {
          const str = v.toString().trim().toLowerCase();
          if (PLACEHOLDERS.has(str)) return false; // treat placeholders as non-numeric
          return !isNaN(Number(v));
        }).length;
        if (numericCount === 0) inferredType = 'categorical';
        else if (numericCount === nonMissing.length) inferredType = 'numeric';
        else inferredType = 'mixed';
      }
      stats[col] = {
        missing: missingCount,
        inferredType,
        unique: new Set(nonMissing.map(v => v.toString())).size,
        placeholderMissing: placeholderCount,
        examplePlaceholders: placeholdersEncountered,
        numericFraction: nonMissing.length
          ? nonMissing.filter(v => !isNaN(Number(v))).length / nonMissing.length
          : undefined,
      };
    });
    return {
      success: true,
      rawRowCount: rows.length,
      headerAbsoluteIndex: headerAbs,
      dataStartIndex,
      columns,
      previewRecords,
      stats,
      config,
      cellFlags,
      limitErrors: limitErrors.length ? limitErrors : undefined,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message, config };
  }
}

/**
 * Parse CSV file and create a Dataset object
 */
export async function parseCSVFile(
  file: File,
  options: CSVParseOptions = {}
): Promise<ParseResult> {
  try {
    const text = await file.text();
    return parseCSVText(text, options);
  } catch (error) {
    return {
      success: false,
      error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse CSV text and create a Dataset object
 */
export function parseCSVText(
  text: string,
  options: CSVParseOptions = {}
): ParseResult {
  try {
    const {
      skipRows = 0,
      headerRow = 0,
      targetColumn: targetOverride,
      featureColumns: featureOverride,
    } = options;

    // Parse raw without header so we can flexibly choose header row
    const result = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
      delimiter: options.delimiter || '',
    });

    if (result.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`,
      };
    }

    const rows = result.data as unknown as string[][];

    if (rows.length === 0) {
      return {
        success: false,
        error: 'CSV file is empty or contains no valid data',
      };
    }

    // Apply skipRows
    if (skipRows >= rows.length) {
      return { success: false, error: 'skipRows exceeds total number of rows' };
    }

    const workingRows = rows.slice(skipRows);
    if (headerRow >= workingRows.length) {
      return {
        success: false,
        error: 'headerRow is out of range after skipping rows',
      };
    }

    const header = workingRows[headerRow].map(
      h => (h ?? '').toString().trim() || 'col'
    );
    // Ensure unique column names
    const seen = new Map<string, number>();
    const columns = header.map(col => {
      const base = col === '' ? 'col' : col;
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base}_${count}`;
    });

    // Data rows start after headerRow within workingRows
    const dataStartIndex = headerRow + 1;
    const dataSection = workingRows.slice(dataStartIndex);

    // Convert to array of record objects
    const data: Record<string, string | number>[] = dataSection.map(r => {
      const obj: Record<string, string | number> = {};
      columns.forEach((col, idx) => {
        obj[col] = r[idx] ?? '';
      });
      return obj;
    });

    if (data.length === 0) {
      return { success: false, error: 'No data rows found after header' };
    }

    // Determine columns, allow overrides
    const targetColumn = targetOverride || columns[columns.length - 1];
    const featureColumns =
      featureOverride || columns.filter(c => c !== targetColumn);

    // Determine if it's classification or regression
    const targetType = inferTargetType(data, targetColumn);

    // Create dataset object
    const dataset: Dataset = {
      data: data,
      features: featureColumns,
      target: targetColumn,
      targetType,
      numSamples: data.length,
      numFeatures: featureColumns.length,
      numClasses:
        targetType === 'classification'
          ? getUniqueValues(data, targetColumn).length
          : undefined,
      skipRows,
      headerRow,
    };

    return {
      success: true,
      data: dataset,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Legacy applyMissingValueStrategy removed; multi-strategy handled in useIngestion.finalize

/**
 * Infer whether the target column is for classification or regression
 */
function inferTargetType(
  data: Record<string, string | number>[],
  targetColumn: string
): 'classification' | 'regression' {
  const values = data
    .map(row => row[targetColumn])
    .filter(val => val !== null && val !== undefined && val !== '');

  if (values.length === 0) {
    return 'regression'; // Default to regression if no valid values
  }

  // Check if all values are numeric
  const numericValues = values.filter(val => !isNaN(Number(val)));
  const isNumeric = numericValues.length === values.length;

  if (!isNumeric) {
    return 'classification';
  }

  // If numeric, check if values are discrete (likely classification)
  const uniqueValues = new Set(numericValues.map(val => Number(val)));
  const isDiscrete =
    uniqueValues.size <= 10 && uniqueValues.size < values.length * 0.1;

  return isDiscrete ? 'classification' : 'regression';
}

/**
 * Get unique values from a column
 */
function getUniqueValues(
  data: Record<string, string | number>[],
  column: string
): (string | number)[] {
  const values = data
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && val !== '');
  return Array.from(new Set(values));
}

/**
 * Preprocess data for training
 */
export function preprocessData(dataset: Dataset): {
  features: number[][];
  targets: number[];
  featureStats?: { mean: number[]; std: number[] };
} {
  const { data, features, target, targetType } = dataset;

  // Extract features and convert to numbers
  const featureMatrix = data.map(row =>
    features.map(feature => {
      const value = row[feature];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    })
  );

  // Extract targets
  let targets: number[];
  if (targetType === 'classification') {
    // Convert to numeric labels
    const uniqueTargets = getUniqueValues(data, target);
    const targetMap = new Map(uniqueTargets.map((val, idx) => [val, idx]));
    targets = data.map(row => targetMap.get(row[target]) || 0);
  } else {
    // Regression - convert to numbers
    targets = data.map(row => {
      const value = row[target];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    });
  }

  // Calculate feature statistics for normalization
  const featureStats = {
    mean: features.map((_, idx) => {
      const values = featureMatrix.map(row => row[idx]);
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    }),
    std: features.map((_, idx) => {
      const values = featureMatrix.map(row => row[idx]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length;
      return Math.sqrt(variance);
    }),
  };

  return {
    features: featureMatrix,
    targets,
    featureStats,
  };
}

/**
 * Normalize features using z-score normalization
 */
export function normalizeFeatures(
  features: number[][],
  stats: { mean: number[]; std: number[] }
): number[][] {
  return features.map(row =>
    row.map((value, idx) => {
      const mean = stats.mean[idx];
      const std = stats.std[idx];
      return std === 0 ? 0 : (value - mean) / std;
    })
  );
}

/**
 * One-hot encode targets for classification
 */
export function oneHotEncode(
  targets: number[],
  numClasses: number
): number[][] {
  return targets.map(target => {
    const encoded = new Array(numClasses).fill(0);
    encoded[target] = 1;
    return encoded;
  });
}
