export interface SpreadsheetFile {
  id: string;
  name: string;
  data: Record<string, unknown>[];
  headers: string[];
  hasHeader: boolean;
}

export interface MergeConfig {
  keyColumn: string;
  selectedColumns: Set<string>;
  files: SpreadsheetFile[];
}
