import * as XLSX from "xlsx";
import type { SpreadsheetFile } from "../types";

export const mergeSpreadsheets = (
  files: SpreadsheetFile[],
  keyColumn: string,
  selectedColumns: Set<string>,
): Record<string, unknown>[] => {
  if (files.length === 0) return [];

  // Validate that all files have the key column
  const filesWithKey = files.filter((file) => file.headers.includes(keyColumn));
  if (filesWithKey.length !== files.length) {
    throw new Error("Not all files contain the selected merge column.");
  }

  // Start with the first file
  let merged = [...filesWithKey[0].data];

  // Merge other files
  for (let i = 1; i < filesWithKey.length; i++) {
    const currentFile = filesWithKey[i];
    merged = mergeTwoDatasets(merged, currentFile.data, keyColumn);
  }

  // Filter columns
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
  keyColumn: string,
): Record<string, unknown>[] => {
  // Create a map of right data by key column for efficient lookup
  const rightMap = new Map<unknown, Record<string, unknown>>();
  right.forEach((row) => {
    const key = row[keyColumn];
    if (key !== null && key !== undefined) {
      rightMap.set(key, row);
    }
  });

  // Merge - only keep rows where both datasets have matching keys
  return left
    .filter((leftRow) => rightMap.has(leftRow[keyColumn]))
    .map((leftRow) => {
      const rightRow = rightMap.get(leftRow[keyColumn])!;
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
