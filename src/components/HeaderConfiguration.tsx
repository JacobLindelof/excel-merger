import React, { useState } from "react";
import "../styles/components.css";
import type { SpreadsheetFile } from "../types";

interface HeaderConfigurationProps {
  file: SpreadsheetFile;
  onHeadersConfigured: (file: SpreadsheetFile) => void;
  onSkip: (file: SpreadsheetFile) => void;
}

export const HeaderConfiguration: React.FC<HeaderConfigurationProps> = ({
  file,
  onHeadersConfigured,
  onSkip,
}) => {
  const [headers, setHeaders] = useState<string[]>(file.headers);
  const [error, setError] = useState<string>("");

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value.trim();
    setHeaders(newHeaders);
  };

  const handleConfirm = () => {
    // Validate headers
    if (headers.some((h) => !h)) {
      setError("All header names are required");
      return;
    }

    if (new Set(headers).size !== headers.length) {
      setError("Header names must be unique");
      return;
    }

    const updatedFile: SpreadsheetFile = {
      ...file,
      headers,
      data: file.data.map((row) => {
        const newRow: Record<string, unknown> = {};
        headers.forEach((header, colIndex) => {
          const values = Object.values(row);
          newRow[header] = values[colIndex] ?? "";
        });
        return newRow;
      }),
    };

    onHeadersConfigured(updatedFile);
  };

  return (
    <div className="header-config">
      <div className="header-config-content">
        <h4>⚙️ Configure Headers for: {file.name}</h4>
        <p>Please provide meaningful names for the columns:</p>

        <div className="headers-form">
          {headers.map((header, index) => (
            <div key={index} className="form-group">
              <label>Column {index + 1}</label>
              <input
                type="text"
                value={header}
                onChange={(e) => handleHeaderChange(index, e.target.value)}
                placeholder={`Header name for column ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button className="btn btn-success" onClick={handleConfirm}>
            Confirm Headers
          </button>
          <button className="btn btn-secondary" onClick={() => onSkip(file)}>
            Skip File
          </button>
        </div>
      </div>
    </div>
  );
};
