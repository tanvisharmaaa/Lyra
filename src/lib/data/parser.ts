import Papa from 'papaparse';
import { Dataset } from '@/store/state';

export interface ParseResult {
  success: boolean;
  data?: Dataset;
  error?: string;
}

export interface CSVParseOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
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
    const parseOptions = {
      header: true,
      skipEmptyLines: true,
      delimiter: '',
      ...options,
    };

    const result = Papa.parse(text, parseOptions);

    if (result.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`,
      };
    }

    const data = result.data as Record<string, any>[];

    if (data.length === 0) {
      return {
        success: false,
        error: 'CSV file is empty or contains no valid data',
      };
    }

    // Auto-detect target column (last column by default)
    const columns = Object.keys(data[0]);
    const targetColumn = columns[columns.length - 1];
    const featureColumns = columns.slice(0, -1);

    // Determine if it's classification or regression
    const targetType = inferTargetType(data, targetColumn);

    // Create dataset object
    const dataset: Dataset = {
      data,
      features: featureColumns,
      target: targetColumn,
      targetType,
      numSamples: data.length,
      numFeatures: featureColumns.length,
      numClasses:
        targetType === 'classification'
          ? getUniqueValues(data, targetColumn).length
          : undefined,
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

/**
 * Infer whether the target column is for classification or regression
 */
function inferTargetType(
  data: Record<string, any>[],
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
function getUniqueValues(data: Record<string, any>[], column: string): any[] {
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
