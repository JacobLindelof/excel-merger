/**
 * Generate a simple hash from an array of strings
 * This hash is used to identify a specific set of columns
 */
export const generateColumnsHash = (columns: string[]): string => {
  const sorted = [...columns].sort();
  const combined = sorted.join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `columns_${Math.abs(hash).toString(36)}`;
};

/**
 * Save selected columns to localStorage
 */
export const saveSelectedColumns = (
  columns: string[],
  selectedColumns: Set<string>,
): void => {
  const hash = generateColumnsHash(columns);
  const selectedArray = Array.from(selectedColumns);
  localStorage.setItem(hash, JSON.stringify(selectedArray));
};

/**
 * Restore selected columns from localStorage
 * Returns null if no saved state exists for these columns
 */
export const restoreSelectedColumns = (
  columns: string[],
): Set<string> | null => {
  const hash = generateColumnsHash(columns);
  const saved = localStorage.getItem(hash);

  if (!saved) return null;

  try {
    const selectedArray = JSON.parse(saved) as string[];
    // Only restore columns that still exist in the current file set
    const validColumns = selectedArray.filter((col) => columns.includes(col));

    return validColumns.length > 0 ? new Set(validColumns) : null;
  } catch {
    return null;
  }
};

/**
 * Clear a specific column selection from localStorage
 */
export const clearColumnSelection = (columns: string[]): void => {
  const hash = generateColumnsHash(columns);
  localStorage.removeItem(hash);
};

interface SavedMergeKeyConfig {
  commonKeyColumn?: string;
  perFileKeyColumns?: Record<string, string>;
}

const getMergeKeyConfigStorageKey = (columns: string[]): string => {
  return `${generateColumnsHash(columns)}_merge_keys`;
};

export const saveMergeKeyConfig = (
  columns: string[],
  config: SavedMergeKeyConfig,
): void => {
  const storageKey = getMergeKeyConfigStorageKey(columns);
  localStorage.setItem(storageKey, JSON.stringify(config));
};

export const restoreMergeKeyConfig = (
  columns: string[],
): SavedMergeKeyConfig | null => {
  const storageKey = getMergeKeyConfigStorageKey(columns);
  const saved = localStorage.getItem(storageKey);

  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as SavedMergeKeyConfig;
    return parsed;
  } catch {
    return null;
  }
};
