import React, { useEffect, useState } from "react";
import "../styles/components.css";
import type { SpreadsheetFile } from "../types";
import {
  restoreSelectedColumns,
  saveSelectedColumns,
} from "../utils/columnMemory";
import { ColumnSelector } from "./ColumnSelector";

interface MergeConfigurationProps {
  files: SpreadsheetFile[];
  onMerge: (keyColumn: string, selectedColumns: Set<string>) => void;
}

export const MergeConfiguration: React.FC<MergeConfigurationProps> = ({
  files,
  onMerge,
}) => {
  const allColumns = files.flatMap((f) => f.headers);
  const commonColumns =
    files.length > 0
      ? files[0].headers.filter((header) =>
          files.every((file) => file.headers.includes(header)),
        )
      : [];

  // Try to restore selected columns from localStorage, otherwise select all columns
  const getInitialSelectedColumns = (): Set<string> => {
    const restored = restoreSelectedColumns(allColumns);
    if (restored) {
      return restored;
    }
    return new Set(allColumns);
  };

  const [selectedKeyColumn, setSelectedKeyColumn] = useState<string>(
    commonColumns[0] || "",
  );
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    getInitialSelectedColumns(),
  );
  const [error, setError] = useState<string>("");

  // Save selected columns to localStorage whenever they change
  useEffect(() => {
    if (allColumns.length > 0) {
      saveSelectedColumns(allColumns, selectedColumns);
    }
  }, [selectedColumns, allColumns.join(",")]);

  const handleMerge = () => {
    if (!selectedKeyColumn) {
      setError("Please select a merge column");
      return;
    }

    if (selectedColumns.size === 0) {
      setError("Please select at least one column to export");
      return;
    }

    setError("");
    onMerge(selectedKeyColumn, selectedColumns);
  };

  return (
    <div className="merge-config">
      <h3>⚙️ Merge Configuration</h3>

      {commonColumns.length === 0 ? (
        <div className="error-message">
          ⚠️ No common columns found across all files. Please ensure all files
          have at least one matching column.
        </div>
      ) : (
        <>
          <div className="config-section">
            <h4>Select Merge Column</h4>
            <p>Choose a common column to merge files on:</p>
            <select
              value={selectedKeyColumn}
              onChange={(e) => setSelectedKeyColumn(e.target.value)}
              className="select-input"
            >
              <option value="">-- Select Column --</option>
              {commonColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <h4>Select Columns to Export</h4>
            <p>Choose which columns to include in the merged result:</p>
            <ColumnSelector
              files={files}
              selectedColumns={selectedColumns}
              onSelectionChange={setSelectedColumns}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="btn btn-primary btn-large" onClick={handleMerge}>
            Merge Spreadsheets
          </button>
        </>
      )}
    </div>
  );
};
