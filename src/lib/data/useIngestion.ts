import { useCallback, useEffect, useRef, useState } from 'react';
import { Dataset } from '@/store/state';
import {
  CSVParseOptions,
  IngestionConfig,
  PreviewResult,
  defaultIngestionConfig,
  generatePreview,
  parseCSVText,
  ColumnMissingStrategy,
  SimpleMissingStrategy,
} from './parser';

export interface IngestionState {
  rawText: string;
  config: IngestionConfig;
  preview: PreviewResult | null;
  isParsing: boolean;
  error: string | null;
}

export interface UseIngestionApi {
  state: IngestionState;
  loadRawText: (text: string) => void;
  updateConfig: (patch: Partial<IngestionConfig>) => void;
  setTarget: (target: string) => void;
  toggleFeature: (feature: string) => void;
  setGlobalStrategy: (strategy: SimpleMissingStrategy) => void;
  setColumnStrategy: (col: string, strategy: ColumnMissingStrategy) => void;
  setColumnConstant: (col: string, value: string | number) => void;
  finalize: () => { dataset?: Dataset; error?: string };
  reset: () => void;
}

export function useIngestion(
  initial?: Partial<IngestionConfig>
): UseIngestionApi {
  const [rawText, setRawText] = useState<string>('');
  const [config, setConfig] = useState<IngestionConfig>({
    ...defaultIngestionConfig,
    ...initial,
  });
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regenerate preview when rawText or core parsing config changes (exclude target/features to avoid loops)
  const regenerate = useCallback(() => {
    if (!rawText) {
      setPreview(null);
      return;
    }
    setIsParsing(true);
    const result = generatePreview(rawText, {
      skipRows: config.skipRows,
      headerRow: config.headerRow,
      previewLimit: config.previewLimit,
    });
    if (!result.success) {
      setError(result.error || 'Preview generation failed');
      setPreview(result);
      setIsParsing(false);
      return;
    }
    setError(null);
    setPreview(result);
    setIsParsing(false);
  }, [rawText, config.skipRows, config.headerRow, config.previewLimit]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  // One-time auto-init for target / features after first successful preview
  const initializedRef = useRef(false);
  useEffect(() => {
    if (
      !preview ||
      !preview.success ||
      !preview.columns ||
      preview.columns.length === 0
    )
      return;
    if (initializedRef.current) return;
    setConfig(prev => {
      let changed = false;
      const next = { ...prev };
      if (!next.targetColumn) {
        next.targetColumn = preview.columns![preview.columns!.length - 1];
        changed = true;
      }
      if (!next.featureColumns || next.featureColumns.length === 0) {
        next.featureColumns = preview.columns!.filter(
          c => c !== next.targetColumn
        );
        changed = true;
      }
      if (!changed) return prev; // avoid triggering effect loop
      return next;
    });
    initializedRef.current = true;
  }, [preview]);

  // Ensure target not in feature list (separate effect; avoids mixing with preview updates)
  useEffect(() => {
    if (!config.targetColumn || !config.featureColumns) return;
    if (!config.featureColumns.includes(config.targetColumn)) return;
    setConfig(prev => ({
      ...prev,
      featureColumns: prev.featureColumns!.filter(f => f !== prev.targetColumn),
    }));
  }, [config.targetColumn, config.featureColumns]);

  const loadRawText = useCallback((text: string) => {
    setRawText(text);
  }, []);

  const updateConfig = useCallback((patch: Partial<IngestionConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const setTarget = useCallback((target: string) => {
    setConfig(prev => ({
      ...prev,
      targetColumn: target,
      featureColumns: (prev.featureColumns || []).filter(c => c !== target),
    }));
  }, []);

  const toggleFeature = useCallback((feature: string) => {
    setConfig(prev => {
      const current = new Set(prev.featureColumns || []);
      if (current.has(feature)) current.delete(feature);
      else if (feature !== prev.targetColumn) current.add(feature);
      return { ...prev, featureColumns: Array.from(current) };
    });
  }, []);

  const setGlobalStrategy = useCallback((strategy: SimpleMissingStrategy) => {
    setConfig(prev => ({ ...prev, globalStrategy: strategy }));
  }, []);

  const setColumnStrategy = useCallback(
    (col: string, strategy: ColumnMissingStrategy) => {
      setConfig(prev => ({
        ...prev,
        columnStrategies: { ...(prev.columnStrategies || {}), [col]: strategy },
      }));
    },
    []
  );

  const setColumnConstant = useCallback(
    (col: string, value: string | number) => {
      setColumnStrategy(col, { type: 'constant', value });
    },
    [setColumnStrategy]
  );

  const finalize = useCallback(() => {
    if (!rawText) return { error: 'No raw text loaded' };
    if (preview?.limitErrors && preview.limitErrors.length) {
      return {
        error:
          'Dataset exceeds configured limits: ' +
          preview.limitErrors.map(e => e.message).join('; '),
      };
    }
    // Parse base data first without applying legacy strategy so we have raw table
    const parseOptions: CSVParseOptions = {
      skipRows: config.skipRows,
      headerRow: config.headerRow,
      targetColumn: config.targetColumn,
      featureColumns: config.featureColumns,
      // intentionally omit missingValueStrategy to handle multi-strategy below
    } as CSVParseOptions;
    const base = parseCSVText(rawText, parseOptions);
    if (!base.success || !base.data) {
      return { error: base.error || 'Failed to parse base dataset' };
    }
    let rows = base.data.data; // raw rows
    const target = base.data.target;
    const features = base.data.features;
    // Determine effective strategy per feature column
    const effective: Record<
      string,
      ColumnMissingStrategy | SimpleMissingStrategy
    > = {};
    features.forEach(col => {
      const ov = config.columnStrategies?.[col];
      effective[col] =
        ov !== undefined ? ov : config.globalStrategy || 'leave-as-is';
    });
    // Target may also have an override even if not a feature
    const targetOverride = config.targetColumn
      ? config.columnStrategies?.[config.targetColumn]
      : undefined;
    const effectiveTargetStrategy:
      | SimpleMissingStrategy
      | ColumnMissingStrategy
      | undefined = targetOverride || config.globalStrategy;
    // Placeholder + whitespace normalization (always applied now)
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
    rows = rows.map(r => {
      const nr = { ...r } as Record<string, string | number>;
      const allCols = new Set<string>([...features]);
      if (target) allCols.add(target);
      allCols.forEach(c => {
        const raw = nr[c];
        if (raw === null || raw === undefined) return;
        const str = raw.toString();
        const trimmedLower = str.trim().toLowerCase();
        if (trimmedLower === '' || PLACEHOLDERS.has(trimmedLower)) {
          nr[c] = '';
        }
      });
      return nr;
    });
    // Collect feature columns that trigger drop-row
    const dropCols = features.filter(c => {
      const s = effective[c];
      const t = typeof s === 'string' ? s : s.type;
      return t === 'drop-row';
    });
    const globalDrop = config.globalStrategy === 'drop-row';
    const targetDrop = (() => {
      if (!target) return false;
      if (globalDrop) return true;
      if (effectiveTargetStrategy) {
        const ttype =
          typeof effectiveTargetStrategy === 'string'
            ? effectiveTargetStrategy
            : effectiveTargetStrategy.type;
        return ttype === 'drop-row';
      }
      return dropCols.length > 0; // fallback: if any feature dropping rows, also enforce target cleanliness
    })();
    // Compute replacement values for each column requiring imputation
    const replacements: Record<string, string | number> = {};
    features.forEach(col => {
      const strat = effective[col];
      const type = typeof strat === 'string' ? strat : strat.type;
      if (!type || ['leave-as-is', 'drop-row'].includes(type)) return;
      if (type === 'zero') {
        replacements[col] = 0;
        return;
      }
      if (type === 'constant') {
        if (typeof strat === 'object') replacements[col] = strat.value;
        return;
      }
      // mean/median/mode
      const presentValues = rows
        .map(r => r[col])
        .filter(v => v !== '' && v !== null && v !== undefined);
      if (!presentValues.length) {
        replacements[col] = 0; // fallback
        return;
      }
      if (type === 'mode') {
        const counts = new Map<string, number>();
        presentValues.forEach(v => {
          const k = v.toString();
          counts.set(k, (counts.get(k) || 0) + 1);
        });
        let best = presentValues[0].toString();
        let bestC = 0;
        counts.forEach((c, v) => {
          if (c > bestC) {
            bestC = c;
            best = v;
          }
        });
        replacements[col] = best;
        return;
      }
      const numeric = presentValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (!numeric.length) {
        replacements[col] = presentValues[0];
        return;
      }
      if (type === 'mean') {
        replacements[col] = numeric.reduce((s, v) => s + v, 0) / numeric.length;
      } else if (type === 'median') {
        const sorted = [...numeric].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        replacements[col] =
          sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
      }
    });
    // Apply row dropping (union across dropCols; if globalDrop then any feature missing OR (if targetDrop) target missing)
    const originalRowCount = rows.length;
    if (globalDrop || dropCols.length || targetDrop) {
      rows = rows.filter(r => {
        const featureMissing = (globalDrop ? features : dropCols).some(c => {
          const val = r[c];
          return val === '' || val === null || val === undefined;
        });
        if (featureMissing) return false;
        if (targetDrop && target) {
          const tv = (r as Record<string, string | number>)[target];
          if (tv === '' || tv === null || tv === undefined) return false;
        }
        return true;
      });
    }
    const droppedRowCount = originalRowCount - rows.length;
    // Apply imputations
    rows = rows.map((r: Record<string, string | number>) => {
      const nr: Record<string, string | number> = { ...r };
      features.forEach(c => {
        const strat = effective[c];
        const type = typeof strat === 'string' ? strat : strat.type;
        if (!type || ['leave-as-is', 'drop-row'].includes(type)) return;
        const val = nr[c];
        if (val === '' || val === null || val === undefined) {
          if (replacements[c] !== undefined) nr[c] = replacements[c];
        }
      });
      return nr;
    });
    // Recompute derived counts & target type after transformations
    const dataset: Dataset = {
      data: rows,
      features,
      target,
      targetType: ((): Dataset['targetType'] => {
        const values = rows
          .map(r => r[target])
          .filter(v => v !== '' && v !== null && v !== undefined);
        if (!values.length) return 'regression';
        const numeric = values.filter(v => !isNaN(Number(v)));
        if (numeric.length !== values.length) return 'classification';
        const uniq = new Set(numeric.map(v => Number(v)));
        const discrete = uniq.size <= 10 && uniq.size < values.length * 0.1;
        return discrete ? 'classification' : 'regression';
      })(),
      numSamples: rows.length,
      numFeatures: features.length,
      numClasses: undefined,
      skipRows: config.skipRows,
      headerRow: config.headerRow,
    };
    if (dataset.targetType === 'classification') {
      const uniq = new Set(
        rows
          .map(r => r[target])
          .filter(v => v !== '' && v !== null && v !== undefined)
      );
      dataset.numClasses = uniq.size;
    }
    // Attach summary (non-breaking metadata cast)
    (dataset as any).imputationSummary = {
      originalRowCount,
      droppedRowCount,
      dropApplied: globalDrop || dropCols.length > 0 || targetDrop,
      dropColumns: dropCols,
      globalDrop,
      targetDrop,
    };
    return { dataset };
  }, [rawText, config]);

  const reset = useCallback(() => {
    setRawText('');
    setConfig({ ...defaultIngestionConfig });
    setPreview(null);
    setError(null);
  }, []);

  return {
    state: { rawText, config, preview, isParsing, error },
    loadRawText,
    updateConfig,
    setTarget,
    toggleFeature,
    setGlobalStrategy,
    setColumnStrategy,
    setColumnConstant,
    finalize,
    reset,
  };
}
