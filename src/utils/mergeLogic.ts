import * as XLSX from "xlsx";
import type { MergeKeyConfig, SpreadsheetFile } from "../types";

export const mergeSpreadsheets = (
  files: SpreadsheetFile[],
  keyConfig: MergeKeyConfig,
  selectedColumns: Set<string>,
): Record<string, unknown>[] => {
  if (files.length === 0) return [];

  const commonKeyColumn = keyConfig.commonKeyColumn;
  const perFileKeyColumns = keyConfig.perFileKeyColumns;

  if (commonKeyColumn) {
    const filesWithKey = files.filter((file) =>
      file.headers.includes(commonKeyColumn),
    );
    if (filesWithKey.length !== files.length) {
      throw new Error("Not all files contain the selected merge column.");
    }

    // Start with the first file
    let merged = [...filesWithKey[0].data];

    // Merge other files
    for (let i = 1; i < filesWithKey.length; i++) {
      const currentFile = filesWithKey[i];
      merged = mergeTwoDatasets(
        merged,
        currentFile.data,
        commonKeyColumn,
        commonKeyColumn,
      );
    }

    return filterColumns(merged, selectedColumns);
  }

  if (
    !perFileKeyColumns ||
    Object.keys(perFileKeyColumns).length !== files.length
  ) {
    throw new Error("Please select one merge column for each file.");
  }

  for (const file of files) {
    const keyColumn = perFileKeyColumns[file.id];
    if (!keyColumn || !file.headers.includes(keyColumn)) {
      throw new Error(`Missing or invalid merge column for file: ${file.name}`);
    }
  }

  // Start with the first file
  let merged = [...files[0].data];
  const baseKey = perFileKeyColumns[files[0].id];

  // Merge other files
  for (let i = 1; i < files.length; i++) {
    const currentFile = files[i];
    const rightKey = perFileKeyColumns[currentFile.id];
    merged = mergeTwoDatasets(merged, currentFile.data, baseKey, rightKey);
  }

  return filterColumns(merged, selectedColumns);
};

const filterColumns = (
  merged: Record<string, unknown>[],
  selectedColumns: Set<string>,
): Record<string, unknown>[] => {
  const finalData = merged.map((row) => {
    const filteredRow: Record<string, unknown> = {};
    selectedColumns.forEach((col) => {
      if (col in row) {
        filteredRow[col] = row[col];
      }
    });
    return filteredRow;
  });

  return finalData;
};

const mergeTwoDatasets = (
  left: Record<string, unknown>[],
  right: Record<string, unknown>[],
  leftKeyColumn: string,
  rightKeyColumn: string,
): Record<string, unknown>[] => {
  // Create a map of right data by key column for efficient lookup
  const rightMap = new Map<unknown, Record<string, unknown>>();
  right.forEach((row) => {
    const key = row[rightKeyColumn];
    if (key !== null && key !== undefined) {
      rightMap.set(key, row);
    }
  });

  // Merge - only keep rows where both datasets have matching keys
  return left
    .filter((leftRow) => rightMap.has(leftRow[leftKeyColumn]))
    .map((leftRow) => {
      const rightRow = rightMap.get(leftRow[leftKeyColumn])!;
      return { ...leftRow, ...rightRow };
    });
};

export const exportToCSV = (
  data: Record<string, unknown>[],
  filename: string,
): void => {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quotes
          const stringValue = String(value ?? "");
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (
  data: Record<string, unknown>[],
  filename: string,
): void => {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Merged Data");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
