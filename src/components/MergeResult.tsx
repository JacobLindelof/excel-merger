import React, { useEffect, useMemo, useState } from "react";
import "../styles/components.css";
import { exportToCSV, exportToExcel } from "../utils/mergeLogic";

interface RowFilterRule {
  id: string;
  column: string;
  condition: "is_empty" | "has_data";
}

interface MergeResultProps {
  data: Record<string, unknown>[];
  onReset: () => void;
}

export const MergeResult: React.FC<MergeResultProps> = ({ data, onReset }) => {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const [filterRules, setFilterRules] = useState<RowFilterRule[]>([]);

  const filteredData = useMemo(() => {
    if (filterRules.length === 0) return data;
    return data.filter((row) =>
      filterRules.every((rule) => {
        const value = row[rule.column];
        const isEmpty =
          value === null ||
          value === undefined ||
          String(value).trim() === "";
        return rule.condition === "is_empty" ? !isEmpty : isEmpty;
      }),
    );
  }, [data, filterRules]);

  const displayData = filteredData.slice(0, 100);
  const hasMore = filteredData.length > 100;

  const addFilterRule = () => {
    setFilterRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), column: headers[0] ?? "", condition: "is_empty" },
    ]);
  };

  const removeFilterRule = (id: string) => {
    setFilterRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateFilterRule = (
    id: string,
    field: keyof Omit<RowFilterRule, "id">,
    value: string,
  ) => {
    setFilterRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const [columnOrder, setColumnOrder] = useState<string[]>(headers);
  const [renamedHeaders, setRenamedHeaders] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    setColumnOrder(headers);
    const nextRenamedHeaders: Record<string, string> = {};
    headers.forEach((header) => {
      nextRenamedHeaders[header] = header;
    });
    setRenamedHeaders(nextRenamedHeaders);
  }, [headers.join("|")]);

  const moveColumn = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columnOrder.length) {
      return;
    }

    const nextOrder = [...columnOrder];
    [nextOrder[index], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[index],
    ];
    setColumnOrder(nextOrder);
  };

  const handleRenameChange = (originalHeader: string, newName: string) => {
    setRenamedHeaders((prev) => ({
      ...prev,
      [originalHeader]: newName,
    }));
  };

  const exportOptions = {
    columnOrder,
    renamedHeaders,
  };

  const handleExportCSV = () => {
    exportToCSV(filteredData, "merged_data", exportOptions);
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, "merged_data", exportOptions);
  };

  return (
    <div className="merge-result">
      <div className="result-header">
        <h3>✅ Merge Complete!</h3>
        <p>
          Total rows: {data.length}
          {filterRules.length > 0 && (
            <span className="filter-row-count">
              {" "}→ {filteredData.length} after filters
            </span>
          )}
        </p>
      </div>

      <div className="result-actions">
        <button className="btn btn-success" onClick={handleExportCSV}>
          📥 Export as CSV
        </button>
        <button className="btn btn-success" onClick={handleExportExcel}>
          📥 Export as Excel
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          ↺ Start Over
        </button>
      </div>

      <div className="result-preview">
        <h4>Row Filters</h4>
        <p className="preview-note">
          Exclude rows based on whether columns have data.
        </p>
        <div className="row-filter-rules">
          {filterRules.map((rule) => (
            <div key={rule.id} className="row-filter-rule">
              <span className="row-filter-label">Exclude row if</span>
              <select
                className="row-filter-select"
                value={rule.column}
                onChange={(e) =>
                  updateFilterRule(rule.id, "column", e.target.value)
                }
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <select
                className="row-filter-select"
                value={rule.condition}
                onChange={(e) =>
                  updateFilterRule(rule.id, "condition", e.target.value)
                }
              >
                <option value="is_empty">is empty</option>
                <option value="has_data">has data</option>
              </select>
              <button
                className="btn btn-small btn-danger"
                onClick={() => removeFilterRule(rule.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary btn-small" onClick={addFilterRule}>
          + Add Filter
        </button>
      </div>

      <div className="result-preview">
        <h4>Export Column Setup</h4>
        <p className="preview-note">
          Reorder and rename columns before exporting.
        </p>
        <div className="export-columns-config">
          {columnOrder.map((header, index) => (
            <div className="export-column-row" key={header}>
              <div className="export-column-order">{index + 1}</div>
              <div className="export-column-original">{header}</div>
              <input
                type="text"
                className="export-column-rename"
                value={renamedHeaders[header] ?? header}
                onChange={(e) => handleRenameChange(header, e.target.value)}
                placeholder="Export name"
              />
              <div className="export-column-actions">
                <button
                  className="btn btn-small"
                  onClick={() => moveColumn(index, "up")}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  className="btn btn-small"
                  onClick={() => moveColumn(index, "down")}
                  disabled={index === columnOrder.length - 1}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="result-preview">
        <h4>Preview (First {displayData.length} rows)</h4>
        {hasMore && (
          <p className="preview-note">
            Showing {displayData.length} of {filteredData.length} rows
          </p>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columnOrder.map((header) => (
                  <th key={header}>{renamedHeaders[header] ?? header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columnOrder.map((header) => (
                    <td key={`${rowIndex}-${header}`}>
                      {String(row[header] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
