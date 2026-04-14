import React from "react";
import "../styles/components.css";

interface HeaderDetectionDialogProps {
  fileName: string;
  onConfirm: (hasHeader: boolean) => void;
}

export const HeaderDetectionDialog: React.FC<HeaderDetectionDialogProps> = ({
  fileName,
  onConfirm,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h3>Header Detection</h3>
        <p>
          Does <strong>{fileName}</strong> have a header row?
        </p>
        <div className="modal-buttons">
          <button className="btn btn-success" onClick={() => onConfirm(true)}>
            Yes, it has headers
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onConfirm(false)}
          >
            No, I'll provide headers
          </button>
        </div>
      </div>
    </div>
  );
};
