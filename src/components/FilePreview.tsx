import React from "react";
import "../styles/components.css";
import type { SpreadsheetFile } from "../types";

interface FilePreviewProps {
  files: SpreadsheetFile[];
  onRemoveFile: (fileId: string) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemoveFile,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="file-preview">
      <h3>📄 Uploaded Files</h3>
      <div className="file-list">
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <div className="file-name">📊 {file.name}</div>
              <div className="file-details">
                {file.data.length} rows × {file.headers.length} columns
              </div>
              <div className="file-headers">
                <strong>Columns:</strong> {file.headers.join(", ")}
              </div>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => onRemoveFile(file.id)}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
