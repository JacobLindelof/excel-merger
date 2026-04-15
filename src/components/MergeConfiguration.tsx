import React, { useEffect, useState } from "react";
import "../styles/components.css";
import type { MergeKeyConfig, SpreadsheetFile } from "../types";
import {
  restoreMergeKeyConfig,
  restoreSelectedColumns,
  saveMergeKeyConfig,
  saveSelectedColumns,
} from "../utils/columnMemory";
import { ColumnSelector } from "./ColumnSelector";

interface MergeConfigurationProps {
  files: SpreadsheetFile[];
  onMerge: (keyConfig: MergeKeyConfig, selectedColumns: Set<string>) => void;
}

export const MergeConfiguration: React.FC<MergeConfigurationProps> = ({
  files,
  onMerge,
}) => {
  const getStableFileKey = (file: SpreadsheetFile): string => {
    return `${file.name}|${file.headers.join("|")}`;
  };

  const allColumns = files.flatMap((f) => f.headers);
  const commonColumns =
    files.length > 0
      ? files[0].headers.filter((header) =>
          files.every((file) => file.headers.includes(header)),
        )
      : [];
  const hasCommonColumns = commonColumns.length > 0;

  // Try to restore selected columns from localStorage, otherwise select all columns
  const getInitialSelectedColumns = (): Set<string> => {
    const restored = restoreSelectedColumns(allColumns);
    if (restored) {
      return restored;
    }
    return new Set(allColumns);
  };

  const getInitialCommonKeyColumn = (): string => {
    if (!hasCommonColumns) {
      return "";
    }

    const restored = restoreMergeKeyConfig(allColumns);
    if (
      restored?.commonKeyColumn &&
      commonColumns.includes(restored.commonKeyColumn)
    ) {
      return restored.commonKeyColumn;
    }

    return commonColumns[0] || "";
  };

  const [selectedKeyColumn, setSelectedKeyColumn] = useState<string>(
    getInitialCommonKeyColumn(),
  );
  const [perFileKeyColumns, setPerFileKeyColumns] = useState<
    Record<string, string>
  >(() => {
    const restored = restoreMergeKeyConfig(allColumns);
    if (restored?.perFileKeyColumns) {
      const validMap: Record<string, string> = {};
      files.forEach((file) => {
        const stableKey = getStableFileKey(file);
        // Backward compatibility: support previously saved file-id keyed values.
        const candidate =
          restored.perFileKeyColumns?.[stableKey] ??
          restored.perFileKeyColumns?.[file.id];
        if (candidate && file.headers.includes(candidate)) {
          validMap[file.id] = candidate;
        } else if (file.headers.length > 0) {
          validMap[file.id] = file.headers[0];
        }
      });
      return validMap;
    }

    const defaults: Record<string, string> = {};
    files.forEach((file) => {
      if (file.headers.length > 0) {
        defaults[file.id] = file.headers[0];
      }
    });
    return defaults;
  });
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

  useEffect(() => {
    if (allColumns.length === 0) return;

    if (hasCommonColumns) {
      saveMergeKeyConfig(allColumns, { commonKeyColumn: selectedKeyColumn });
      return;
    }

    const stablePerFileKeyColumns: Record<string, string> = {};
    files.forEach((file) => {
      const selectedKey = perFileKeyColumns[file.id];
      if (selectedKey) {
        stablePerFileKeyColumns[getStableFileKey(file)] = selectedKey;
      }
    });

    saveMergeKeyConfig(allColumns, { perFileKeyColumns: stablePerFileKeyColumns });
  }, [
    allColumns.join(","),
    files.map((file) => getStableFileKey(file)).join(","),
    hasCommonColumns,
    selectedKeyColumn,
    JSON.stringify(perFileKeyColumns),
  ]);

  const handlePerFileKeyChange = (fileId: string, keyColumn: string) => {
    setPerFileKeyColumns((prev) => ({
      ...prev,
      [fileId]: keyColumn,
    }));
  };

  const handleMerge = () => {
    let keyConfig: MergeKeyConfig;

    if (hasCommonColumns) {
      if (!selectedKeyColumn) {
        setError("Please select a merge column");
        return;
      }
      keyConfig = { commonKeyColumn: selectedKeyColumn };
    } else {
      const missingSelection = files.some(
        (file) => !perFileKeyColumns[file.id],
      );
      if (missingSelection) {
        setError("Please select one merge column for each file");
        return;
      }
      keyConfig = { perFileKeyColumns };
    }

    if (selectedColumns.size === 0) {
      setError("Please select at least one column to export");
      return;
    }

    setError("");
    onMerge(keyConfig, selectedColumns);
  };

  return (
    <div className="merge-config">
      <h3>⚙️ Merge Configuration</h3>

      <>
        <div className="config-section">
          <h4>Select Merge Keys</h4>
          {hasCommonColumns ? (
            <>
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
            </>
          ) : (
            <>
              <div className="info-message">
                No common column names detected. Select one key column per file.
              </div>
              <div className="per-file-key-grid">
                {files.map((file) => (
                  <div className="per-file-key-row" key={file.id}>
                    <label
                      className="per-file-key-label"
                      htmlFor={`key-${file.id}`}
                    >
                      {file.name}
                    </label>
                    <select
                      id={`key-${file.id}`}
                      value={perFileKeyColumns[file.id] || ""}
                      onChange={(e) =>
                        handlePerFileKeyChange(file.id, e.target.value)
                      }
                      className="select-input"
                    >
                      <option value="">-- Select Column --</option>
                      {file.headers.map((header) => (
                        <option key={`${file.id}-${header}`} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}
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
    </div>
  );
};
