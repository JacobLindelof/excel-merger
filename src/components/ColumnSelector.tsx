import React, { useMemo, useState } from "react";
import "../styles/components.css";
import type { SpreadsheetFile } from "../types";

interface ColumnSelectorProps {
  files: SpreadsheetFile[];
  selectedColumns: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  files,
  selectedColumns,
  onSelectionChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Get all unique columns across all files
  const allColumns = Array.from(
    new Set(files.flatMap((f) => f.headers)),
  ).sort();

  const filteredColumns = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return allColumns;
    }

    return allColumns.filter((column) =>
      column.toLowerCase().includes(normalizedQuery),
    );
  }, [allColumns, searchQuery]);

  const handleSelectAll = () => {
    onSelectionChange(new Set(allColumns));
  };

  const handleDeselectAll = () => {
    onSelectionChange(new Set());
  };

  const handleColumnToggle = (column: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(column)) {
      newSelected.delete(column);
    } else {
      newSelected.add(column);
    }
    onSelectionChange(newSelected);
  };

  return (
    <div className="column-selector">
      <div className="column-search">
        <input
          type="text"
          className="column-search-input"
          placeholder="Search columns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="selector-controls">
        <button className="btn btn-small" onClick={handleSelectAll}>
          Select All
        </button>
        <button className="btn btn-small" onClick={handleDeselectAll}>
          Deselect All
        </button>
      </div>

      <div className="columns-grid">
        {filteredColumns.length === 0 ? (
          <div className="column-search-empty">
            No columns match your search.
          </div>
        ) : (
          filteredColumns.map((column) => (
            <div key={column} className="column-checkbox">
              <input
                type="checkbox"
                id={`col-${column}`}
                checked={selectedColumns.has(column)}
                onChange={() => handleColumnToggle(column)}
              />
              <label htmlFor={`col-${column}`}>{column}</label>
            </div>
          ))
        )}
      </div>

      <div className="selected-info">
        Selected {selectedColumns.size} of {allColumns.length} columns
        {searchQuery.trim() && ` (showing ${filteredColumns.length} filtered)`}
      </div>
    </div>
  );
};
