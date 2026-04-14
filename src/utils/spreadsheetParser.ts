import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { SpreadsheetFile } from "../types";

export const parseCSVFile = (
  file: File,
  hasHeader: boolean,
): Promise<{ headers: string[]; data: Record<string, unknown>[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: hasHeader,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, unknown>[];

        if (hasHeader) {
          const headers = results.meta.fields || [];
          resolve({ headers, data });
        } else {
          // If no header, use column indices as headers
          const headers =
            data.length > 0
              ? Object.keys(data[0]).map((_, i) => `Column ${i + 1}`)
              : [];
          resolve({ headers, data });
        }
      },
      error: (error) => reject(error),
    });
  });
};

export const parseExcelFile = (
  file: File,
  hasHeader: boolean,
): Promise<{ headers: string[]; data: Record<string, unknown>[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(worksheet, {
          header: hasHeader ? 1 : undefined,
          defval: "",
        }) as Record<string, unknown>[];

        let headers: string[] = [];

        if (hasHeader && data.length > 0) {
          headers = Object.keys(data[0]);
        } else if (!hasHeader && data.length > 0) {
          // Use column indices as headers
          const firstRow = data[0];
          headers = Object.keys(firstRow).map((_, i) => `Column ${i + 1}`);
        }

        resolve({ headers, data });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

export const parseFile = async (
  file: File,
  hasHeader: boolean,
): Promise<SpreadsheetFile> => {
  const fileId = `${file.name}-${Date.now()}`;
  const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
  const isExcel =
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls");

  if (!isCSV && !isExcel) {
    throw new Error(
      "Unsupported file format. Please upload CSV or Excel files.",
    );
  }

  try {
    let result;
    if (isCSV) {
      result = await parseCSVFile(file, hasHeader);
    } else {
      result = await parseExcelFile(file, hasHeader);
    }

    return {
      id: fileId,
      name: file.name,
      headers: result.headers,
      data: result.data,
      hasHeader,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
