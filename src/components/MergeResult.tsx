import React from "react";
import "../styles/components.css";
import { exportToCSV, exportToExcel } from "../utils/mergeLogic";

interface MergeResultProps {
  data: Record<string, unknown>[];
  onReset: () => void;
}

export const MergeResult: React.FC<MergeResultProps> = ({ data, onReset }) => {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const displayData = data.slice(0, 100); // Show first 100 rows
  const hasMore = data.length > 100;

  const handleExportCSV = () => {
    exportToCSV(data, "merged_data");
  };

  const handleExportExcel = () => {
    exportToExcel(data, "merged_data");
  };

  return (
    <div className="merge-result">
      <div className="result-header">
        <h3>✅ Merge Complete!</h3>
        <p>Total rows: {data.length}</p>
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
        <h4>Preview (First {displayData.length} rows)</h4>
        {hasMore && (
          <p className="preview-note">
            Showing {displayData.length} of {data.length} rows
          </p>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header) => (
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
